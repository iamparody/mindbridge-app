// Blueprint section 9.3 — keyword risk classifier
// classify(text) → { severity: 'critical'|'high'|'medium', category, keyword } or null

const KEYWORDS = {
  critical: [
    // Self-harm ideation
    { category: 'self_harm', keywords: [
      'hurt myself','hurting myself','cut myself','cutting myself','self harm','self-harm',
      'end it all','ending it all','don\'t want to be here','dont want to be here',
      'want to disappear','wish i was dead',
    ]},
    // Suicidal ideation
    { category: 'suicidal_ideation', keywords: [
      'kill myself','killing myself','want to die','wanted to die','suicide','suicidal',
      'no reason to live','end my life','ending my life','take my life','rather be dead',
      'better off dead','thinking of suicide',
    ]},
  ],
  high: [
    // Abuse disclosure
    { category: 'abuse_disclosure', keywords: [
      'being abused','he hits me','she hits me','they hurt me','being hurt by',
      'domestic violence','sexual abuse','being assaulted','he abuses me',
    ]},
    // Severe distress
    { category: 'severe_distress', keywords: [
      'can\'t cope','cannot cope','falling apart','breaking down','losing my mind',
      'completely broken','can\'t go on','cannot go on','giving up on life',
      'no way out','feel trapped','absolutely hopeless',
    ]},
    // Substance crisis
    { category: 'substance_crisis', keywords: [
      'overdose','took too many','took too much','drunk and scared',
      'mixed pills','swallowed a lot','can\'t stop drinking',
    ]},
  ],
  medium: [
    // Moderate distress
    { category: 'moderate_distress', keywords: [
      'really struggling','so anxious','can\'t sleep','cannot sleep',
      'feel hopeless','feeling hopeless','totally overwhelmed',
      'can\'t handle','so depressed','very depressed','feel worthless',
      'exhausted and sad','nothing matters','what\'s the point',
    ]},
  ],
};

function classify(text) {
  if (!text || typeof text !== 'string') return null;
  const lower = text.toLowerCase();

  for (const severity of ['critical', 'high', 'medium']) {
    for (const group of KEYWORDS[severity]) {
      for (const keyword of group.keywords) {
        if (lower.includes(keyword)) {
          return { severity, category: group.category, keyword };
        }
      }
    }
  }
  return null;
}

module.exports = { classify };
