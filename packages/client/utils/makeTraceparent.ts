const toHex = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')

const randomHex = (byteLength: number) => toHex(crypto.getRandomValues(new Uint8Array(byteLength)))

const makeTraceparent = () => `00-${randomHex(16)}-${randomHex(8)}-01`

export default makeTraceparent
