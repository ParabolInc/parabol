// https://github.com/sindresorhus/crypto-random-string/blob/master/index.js
import crypto from 'crypto'

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const generateRandomString = (length: number, characters = ALPHABET) => {
  // Generating entropy is faster than complex math operations, so we use the simplest way
  const characterCount = characters.length
  const maxValidSelector = Math.floor(0x10000 / characterCount) * characterCount - 1 // Using values above this will ruin distribution when using modular division
  const entropyLength = 2 * Math.ceil(1.1 * length) // Generating a bit more than required so chances we need more than one pass will be really low
  let string = ''
  let stringLength = 0

  while (stringLength < length) {
    // In case we had many bad values, which may happen for character sets of size above 0x8000 but close to it
    const entropy = crypto.randomBytes(entropyLength)
    let entropyPosition = 0

    while (entropyPosition < entropyLength && stringLength < length) {
      const entropyValue = entropy.readUInt16LE(entropyPosition)
      entropyPosition += 2
      if (entropyValue > maxValidSelector) {
        // Skip values which will ruin distribution when using modular division
        continue
      }

      string += characters[entropyValue % characterCount]
      stringLength++
    }
  }

  return string
}

export default generateRandomString
