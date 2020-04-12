/*
  This is somehow WAY faster than bit twiddling with Buffers (e.g. Buffer.from([i>>24,i>>16,i>>8,i]))
  https://stackoverflow.com/a/6573119/3155110
*/

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-'
const len = ALPHABET.length

const numToBase64 = (residual: number) => {
  let result = ''
  while (true) {
    const rixit = residual % len
    result = ALPHABET.charAt(rixit) + result
    residual = ~~(residual / len)
    if (residual === 0) return result
  }
}

export default numToBase64
