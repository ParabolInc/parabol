/**
 * Clean up a list of simple English tokenization artifacts like spaces before punctuations and abbreviated forms
 * @param {string} text The text to clean up.
 * @returns {string} The cleaned up text.
 */
export function clean_up_tokenization(text) {
  // Clean up a list of simple English tokenization artifacts
  // like spaces before punctuations and abbreviated forms
  return text
    .replace(/ \./g, '.')
    .replace(/ \?/g, '?')
    .replace(/ \!/g, '!')
    .replace(/ ,/g, ',')
    .replace(/ \' /g, "'")
    .replace(/ n\'t/g, "n't")
    .replace(/ \'m/g, "'m")
    .replace(/ \'s/g, "'s")
    .replace(/ \'ve/g, "'ve")
    .replace(/ \'re/g, "'re")
}
