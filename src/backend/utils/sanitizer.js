// Blueprint section 9.4 — AI output sanitizer
// Strips diagnostic language and prescriptive statements from LLM output.
// If >40% of content is stripped, returns a safe fallback instead.

const SAFE_FALLBACK =
  "I want to make sure I'm being helpful here. Can you tell me more about what you're feeling right now?";

const DIAGNOSTIC_PATTERNS = [
  /you have\s+(a\s+)?(clinical\s+)?\w+(\s+disorder)?/gi,
  /you are suffering from/gi,
  /this is (a\s+)?\w+(\s+disorder)?/gi,
  /you('ve| have) been diagnosed/gi,
  /sounds like (a\s+)?\w+(\s+disorder)/gi,
  /that('s| is) (a\s+)?symptom of/gi,
  /you('re| are) (showing signs of|exhibiting)/gi,
];

const PRESCRIPTIVE_PATTERNS = [
  /you should take\s+\w+/gi,
  /try (this |the |)medication/gi,
  /take\s+\w+\s+(mg|milligrams?|pills?|tablets?)/gi,
  /see a (doctor|psychiatrist|physician) about/gi,
  /prescribe/gi,
  /dosage of/gi,
  /i('d| would) recommend (taking|medication|a drug)/gi,
];

function sanitize(text) {
  if (!text) return SAFE_FALLBACK;

  const original = text;
  let result = text;

  for (const pattern of [...DIAGNOSTIC_PATTERNS, ...PRESCRIPTIVE_PATTERNS]) {
    result = result.replace(pattern, '');
  }

  // Clean up double spaces / orphaned punctuation left by removals
  result = result.replace(/\s{2,}/g, ' ').replace(/\s([.,!?])/g, '$1').trim();

  const removedRatio = 1 - result.length / original.length;
  if (removedRatio > 0.4) {
    return SAFE_FALLBACK;
  }

  return result || SAFE_FALLBACK;
}

module.exports = { sanitize };
