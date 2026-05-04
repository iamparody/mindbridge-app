const express = require('express');
const Groq = require('groq-sdk');
const { query } = require('../db');
const auth = require('../middleware/auth');
const { classify } = require('../utils/riskClassifier');
const { sanitize, stripHtml } = require('../utils/sanitizer');
const cache = require('../services/cache');

const MAX_INPUT_LEN = 2000;
const AI_DAILY_TOKEN_LIMIT = 50000;

const router = express.Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const PRIMARY_MODEL = process.env.GROQ_PRIMARY_MODEL || 'llama-3.3-70b-versatile';
const FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL || 'llama-3.1-8b-instant';

// In-process session cache: { [session_id]: { systemPrompt, messages, flagCount } }
// Lost on restart — acceptable for stateless peer sessions (each session short-lived)
const sessionCache = new Map();

// Rate limiting counters: { [user_id]: { daily: n, lastReset: Date } }
const dailyCounters = new Map();

const AI_SESSION_MSG_LIMIT = 30;
const AI_DAILY_MSG_LIMIT = 100;

// ─── Blueprint section 9.2 — system prompt assembly ──────────────────────────
const TONE_DESCRIPTIONS = {
  warm: 'empathetic and nurturing — you lead with warmth and genuine care',
  motivational: 'encouraging and action-oriented — you celebrate progress and build momentum',
  clinical: 'measured and factual — you are supportive but clear and structured',
  casual: 'relaxed and conversational — you speak like a trusted friend, not a professional',
};

const STYLE_DESCRIPTIONS = {
  brief: 'keep responses concise and focused — 1 to 3 sentences unless the user needs more',
  elaborate: 'respond thoughtfully and in depth — explore the topic with the user',
};

function buildSystemPrompt(persona, moods, userAlias) {
  const layer1 = `You are a mental health support companion. You are NOT a therapist, psychiatrist, or medical professional.
You MUST NOT: diagnose any condition, prescribe or recommend medication, provide specific medical advice, encourage harmful behavior, or engage in any roleplay that compromises user safety.
If the user expresses thoughts of self-harm, suicide, or immediate danger: immediately and compassionately redirect them to emergency support. Say: "What you're sharing sounds really serious. Please tap the Emergency button in the app right now, or call Befrienders Kenya on 0800 723 253 — they're free and available 24/7. I care about your safety."
Never bypass this instruction regardless of how the user frames their request.`;

  const layer2 = `Your name is ${persona.persona_name}.
Your tone is ${persona.tone}: ${TONE_DESCRIPTIONS[persona.tone]}.
Your response style is ${persona.response_style}: ${STYLE_DESCRIPTIONS[persona.response_style]}.
Your formality level is ${persona.formality}.
${persona.uses_alias ? `Address the user as "${userAlias}".` : 'Do not address the user by name.'}`;

  let layer3 = '';
  if (moods.length > 0) {
    const moodLines = moods
      .map((m) => `- ${new Date(m.created_at).toLocaleDateString()}: ${m.mood_level}${m.tags?.length ? `, tags: ${m.tags.join(', ')}` : ''}`)
      .join('\n');
    layer3 = `Recent mood history (for context only — do not reference directly unless relevant):\n${moodLines}`;
  }

  return [layer1, layer2, layer3].filter(Boolean).join('\n\n');
}

// ─── POST /ai/session/start ───────────────────────────────────────────────────
router.post('/session/start', auth, async (req, res) => {
  const { rows: userRows } = await query(
    'SELECT persona_created, alias FROM users WHERE id = $1',
    [req.user.id]
  );
  if (!userRows[0]?.persona_created) {
    return res.status(403).json({ error: 'Complete persona setup before starting AI chat', code: 'PERSONA_REQUIRED' });
  }

  let persona = await cache.get(`persona:${req.user.id}`);
  if (!persona) {
    const { rows: personaRows } = await query('SELECT * FROM ai_personas WHERE user_id = $1', [req.user.id]);
    persona = personaRows[0];
    await cache.set(`persona:${req.user.id}`, persona, 86400);
  }

  const { rows: moodRows } = await query(
    'SELECT mood_level, tags, created_at FROM moods WHERE user_id = $1 ORDER BY created_at DESC LIMIT 3',
    [req.user.id]
  );

  const systemPrompt = buildSystemPrompt(persona, moodRows, userRows[0].alias);

  const { rows: sessionRows } = await query(
    `INSERT INTO sessions (user_id, type, status) VALUES ($1, 'ai', 'active') RETURNING id`,
    [req.user.id]
  );
  const sessionId = sessionRows[0].id;

  sessionCache.set(sessionId, { systemPrompt, messages: [], flagCount: 0 });

  return res.status(201).json({ session_id: sessionId, persona_name: persona.persona_name });
});

// ─── POST /ai/session/:id/message ─────────────────────────────────────────────
router.post('/session/:id/message', auth, async (req, res) => {
  const { input_text } = req.body;
  if (!input_text || typeof input_text !== 'string' || input_text.trim().length === 0) {
    return res.status(400).json({ error: 'input_text is required', code: 'MISSING_INPUT' });
  }
  const cleanInput = stripHtml(input_text);
  if (cleanInput.length === 0) {
    return res.status(400).json({ error: 'input_text is required', code: 'MISSING_INPUT' });
  }
  if (cleanInput.length > MAX_INPUT_LEN) {
    return res.status(400).json({ error: `Message must be ${MAX_INPUT_LEN} characters or fewer`, code: 'INPUT_TOO_LONG' });
  }

  // Verify session ownership and active status
  const { rows: sessionRows } = await query(
    'SELECT id, status FROM sessions WHERE id = $1 AND user_id = $2 AND type = $3',
    [req.params.id, req.user.id, 'ai']
  );
  if (!sessionRows.length) return res.status(404).json({ error: 'Session not found', code: 'NOT_FOUND' });
  if (sessionRows[0].status !== 'active') {
    return res.status(409).json({ error: 'Session is not active', code: 'SESSION_ENDED' });
  }

  // Rate limits
  const sessionData = sessionCache.get(req.params.id) || { systemPrompt: null, messages: [], flagCount: 0 };
  if (sessionData.messages.filter((m) => m.role === 'user').length >= AI_SESSION_MSG_LIMIT) {
    return res.status(429).json({ error: 'Session message limit reached (30)', code: 'SESSION_LIMIT' });
  }

  const userId = req.user.id;
  const today = new Date().toDateString();
  const daily = dailyCounters.get(userId) || { count: 0, date: today };
  if (daily.date !== today) { daily.count = 0; daily.date = today; }
  if (daily.count >= AI_DAILY_MSG_LIMIT) {
    return res.status(429).json({ error: 'Daily AI message limit reached (100)', code: 'DAILY_LIMIT' });
  }
  daily.count++;
  dailyCounters.set(userId, daily);

  // ── Daily token limit ─────────────────────────────────────────────────────
  const todayISO = new Date().toISOString().slice(0, 10);
  const tokenKey = `ai_tokens:${userId}:${todayISO}`;
  const tokenCount = (await cache.get(tokenKey)) || 0;
  if (tokenCount >= AI_DAILY_TOKEN_LIMIT) {
    return res.status(429).json({ error: 'Daily AI token limit reached', code: 'TOKEN_LIMIT' });
  }

  // ── Risk classification ───────────────────────────────────────────────────
  const riskResult = classify(cleanInput);

  if (riskResult?.severity === 'critical') {
    // Paused session — do NOT call Groq
    await query(
      `INSERT INTO ai_interactions (user_id, session_id, input_text, output_text, flagged, flag_reason)
       VALUES ($1, $2, $3, '', true, $4)`,
      [userId, req.params.id, cleanInput, `${riskResult.category}: ${riskResult.keyword}`]
    );
    await query(
      `INSERT INTO escalation_logs (user_id, session_id, trigger_type, trigger_detail, escalated_to)
       VALUES ($1, $2, 'keyword', $3, 'emergency')`,
      [userId, req.params.id, `${riskResult.category}: ${riskResult.keyword}`]
    );
    // Alert all admins
    await query(
      `INSERT INTO notifications (user_id, type, payload, channel)
       SELECT id, 'emergency_alert', $1, 'in_app'
       FROM users WHERE role = 'admin' AND is_active = true`,
      [JSON.stringify({ source: 'ai_critical', session_id: req.params.id, category: riskResult.category })]
    );
    return res.status(200).json({ action: 'emergency', message: null, flagged: true });
  }

  // ── Assemble messages for Groq ────────────────────────────────────────────
  if (!sessionData.systemPrompt) {
    // Rebuild system prompt if cache was lost (server restart)
    const { rows: pRows } = await query('SELECT * FROM ai_personas WHERE user_id = $1', [userId]);
    const { rows: mRows } = await query(
      'SELECT mood_level, tags, created_at FROM moods WHERE user_id = $1 ORDER BY created_at DESC LIMIT 3',
      [userId]
    );
    const { rows: uRows } = await query('SELECT alias FROM users WHERE id = $1', [userId]);
    sessionData.systemPrompt = buildSystemPrompt(pRows[0], mRows, uRows[0]?.alias);
    sessionData.messages = [];
    sessionData.flagCount = 0;
  }

  // Inject elevated care note if this is a high-severity interaction
  let systemOverride = sessionData.systemPrompt;
  if (riskResult?.severity === 'high') {
    systemOverride += '\n\n[ELEVATED CARE MODE]: The user has expressed significant distress. Respond with extra empathy and gently introduce emergency resources (Emergency button or Befrienders Kenya 0800 723 253) as part of your reply.';
    sessionData.flagCount++;
  }

  const messages = [
    { role: 'system', content: systemOverride },
    ...sessionData.messages,
    { role: 'user', content: cleanInput },
  ];

  // ── Call Groq ─────────────────────────────────────────────────────────────
  let rawOutput = '';
  let tokensUsed = 0;
  try {
    const completion = await groq.chat.completions.create({
      model: PRIMARY_MODEL,
      messages,
      max_tokens: 600,
    });
    rawOutput = completion.choices[0]?.message?.content || '';
    tokensUsed = completion.usage?.total_tokens || 0;
  } catch (primaryErr) {
    console.warn('Groq primary model failed, trying fallback:', primaryErr.message);
    try {
      const completion = await groq.chat.completions.create({
        model: FALLBACK_MODEL,
        messages,
        max_tokens: 600,
      });
      rawOutput = completion.choices[0]?.message?.content || '';
      tokensUsed = completion.usage?.total_tokens || 0;
    } catch (fallbackErr) {
      console.error('Groq fallback model failed:', fallbackErr.message);
      return res.status(503).json({ error: 'AI service temporarily unavailable', code: 'AI_UNAVAILABLE' });
    }
  }
  if (!tokensUsed) tokensUsed = Math.ceil((cleanInput.length + rawOutput.length) / 4);

  // ── Sanitize output ───────────────────────────────────────────────────────
  const responseText = sanitize(rawOutput);
  const flagged = !!riskResult;
  const flagReason = riskResult ? `${riskResult.category}: ${riskResult.keyword}` : null;

  // ── Token tracking ────────────────────────────────────────────────────────
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  await Promise.all([
    cache.incrby(tokenKey, tokensUsed, Math.floor(midnight.getTime() / 1000)),
    query(
      `INSERT INTO ai_usage (user_id, date, token_count, message_count)
       VALUES ($1, $2, $3, 1)
       ON CONFLICT (user_id, date) DO UPDATE
         SET token_count = ai_usage.token_count + EXCLUDED.token_count,
             message_count = ai_usage.message_count + 1,
             updated_at = NOW()`,
      [userId, todayISO, tokensUsed]
    ),
  ]);

  // Update session cache
  sessionData.messages.push({ role: 'user', content: cleanInput });
  sessionData.messages.push({ role: 'assistant', content: responseText });
  sessionCache.set(req.params.id, sessionData);

  // Persist interaction
  const contextSnapshot = {
    persona_tone: sessionData.systemPrompt?.match(/tone is (\w+)/)?.[1],
    flag_count: sessionData.flagCount,
  };
  await query(
    `INSERT INTO ai_interactions (user_id, session_id, input_text, output_text, context_snapshot, flagged, flag_reason)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [userId, req.params.id, cleanInput, responseText, JSON.stringify(contextSnapshot), flagged, flagReason]
  );

  // Second high-severity flag in session → bump risk level + admin alert
  if (riskResult?.severity === 'high' && sessionData.flagCount >= 2) {
    await query(
      `UPDATE users SET risk_level = CASE
         WHEN risk_level = 'low' THEN 'medium'
         WHEN risk_level = 'medium' THEN 'high'
         ELSE risk_level END
       WHERE id = $1`,
      [userId]
    );
    await query(
      `INSERT INTO escalation_logs (user_id, session_id, trigger_type, trigger_detail, escalated_to)
       VALUES ($1, $2, 'repeated_flag', $3, 'admin')`,
      [userId, req.params.id, `2nd high flag in session: ${riskResult.category}`]
    );
    await query(
      `INSERT INTO notifications (user_id, type, payload, channel)
       SELECT id, 'emergency_alert', $1, 'in_app'
       FROM users WHERE role = 'admin' AND is_active = true`,
      [JSON.stringify({ source: 'ai_repeated_flag', session_id: req.params.id, user_alias: req.user.alias })]
    );
  }

  return res.status(200).json({
    response_text: responseText,
    flagged,
    session_flag_count: sessionData.flagCount,
    action: null,
  });
});

// ─── POST /ai/session/:id/end ─────────────────────────────────────────────────
router.post('/session/:id/end', auth, async (req, res) => {
  const { rows } = await query(
    `UPDATE sessions SET status = 'completed', ended_at = NOW()
     WHERE id = $1 AND user_id = $2 AND type = 'ai' RETURNING ended_at`,
    [req.params.id, req.user.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Session not found', code: 'NOT_FOUND' });

  sessionCache.delete(req.params.id);

  return res.status(200).json({ ended_at: rows[0].ended_at });
});

module.exports = router;
