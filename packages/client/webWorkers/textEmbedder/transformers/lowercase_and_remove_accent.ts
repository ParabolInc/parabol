/**
 * Helper function to remove accents from a string.
 * @param {string} text The text to remove accents from.
 * @returns {string} The text with accents removed.
 */
function remove_accents(text) {
  return text.replace(/[\u0300-\u036f]/g, '')
}

/**
 * Helper function to lowercase a string and remove accents.
 * @param {string} text The text to lowercase and remove accents from.
 * @returns {string} The lowercased text with accents removed.
 */
export function lowercase_and_remove_accent(text) {
  return remove_accents(text.toLowerCase())
}
