/**
 * Sanitizes a flashcard definition by stripping the term name (and any distractor terms)
 * so that multiple-choice and true/false question answer choices do not give away the term being asked.
 *
 * @param {string} definition - The definition string to sanitize
 * @param {string|string[]} termsToRemove - Term or list of terms that should not appear
 * @returns {string} - Cleaned definition suitable for question answer choices
 */
export function sanitizeDefinition(definition, termsToRemove = []) {
  if (!definition || typeof definition !== 'string') return '';
  let cleaned = definition.trim();

  // Normalize terms to an array of non-empty strings
  const rawTerms = Array.isArray(termsToRemove) ? termsToRemove : [termsToRemove];
  const terms = rawTerms
    .filter(t => typeof t === 'string' && t.trim().length > 0)
    .map(t => t.trim());

  if (terms.length === 0) return cleaned;

  // Sort terms by length descending so longer compound terms match before sub-terms
  terms.sort((a, b) => b.length - a.length);

  for (const term of terms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 1. Remove leading term with optional articles, parentheticals, and copula verbs
    // Examples handled:
    // - "Mitosis is the process of..." -> "The process of..."
    // - "The CPU (Central Processing Unit) is the primary..." -> "The primary..."
    // - "Newton's First Law states that an object..." -> "An object..."
    // - "Photosynthesis: The process used by plants..." -> "The process used by plants..."
    // - "Encapsulation refers to the bundling..." -> "The bundling..."
    const leadingPattern = new RegExp(
      `^(?:(?:the|a|an)\\s+)?${escaped}(?:\\s*\\([^)]*\\))?\\s*(?::|—|-|–|\\bis\\b|\\bare\\b|\\bwas\\b|\\bwere\\b|\\brefers\\s+to\\b|\\bmeans\\b|\\bdefined\\s+as\\b|\\bcan\\s+be\\s+defined\\s+as\\b|\\bstates\\s+that\\b|\\bdescribes\\b|\\brepresents\\b|\\bconsists\\s+of\\b)\\s*`,
      'i'
    );

    if (leadingPattern.test(cleaned)) {
      cleaned = cleaned.replace(leadingPattern, '');
    } else {
      // Direct leading term followed by punctuation: "Term: Definition" or "Term - Definition"
      const directPunctPattern = new RegExp(`^${escaped}\\s*[:—–-]\\s*`, 'i');
      if (directPunctPattern.test(cleaned)) {
        cleaned = cleaned.replace(directPunctPattern, '');
      }
    }

    // 2. Remove standalone parenthetical term mentions: e.g. "(Photosynthesis)" or "(e.g., Photosynthesis)"
    const parenPattern = new RegExp(`\\(\\s*(?:e\\.?g\\.?,?\\s*)?${escaped}\\s*\\)`, 'gi');
    cleaned = cleaned.replace(parenPattern, '');

    // 3. Mask any remaining whole-word occurrences of the term in the middle with a neutral descriptor
    const midWordPattern = new RegExp(`\\b${escaped}\\b`, 'gi');
    cleaned = cleaned.replace(midWordPattern, 'this concept');
  }

  // 4. Clean up any leftover punctuation, leading colons/dashes, or double spaces
  cleaned = cleaned
    .replace(/^[:—–-,.]\s*/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // 5. Ensure the first character is capitalized
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned;
}

