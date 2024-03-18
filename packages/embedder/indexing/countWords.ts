export function countWords(text: string) {
  let count = 0
  let inWord = false

  for (const char of text) {
    if (/\w/.test(char)) {
      if (!inWord) {
        count++
        inWord = true
      }
    } else {
      inWord = false
    }
  }

  return count
}
