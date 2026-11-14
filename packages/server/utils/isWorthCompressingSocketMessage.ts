import type {RecognizedString} from 'uWebSockets.js'

// A message this small fits in one packet once TCP, TLS and websocket headers are added, so compressing it saves no
// round trip, and most socket messages are a few hundred bytes that deflate barely shrinks
const MIN_COMPRESSED_BYTES = 1400

const isWorthCompressingSocketMessage = (message: RecognizedString) =>
  (typeof message === 'string' ? message.length : message.byteLength) >= MIN_COMPRESSED_BYTES

export default isWorthCompressingSocketMessage
