const MESSAGE_NORMALIZERS: [RegExp, string][] = [
  [/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '<uuid>'],
  [/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '<email>'],
  [/\bhttps?:\/\/\S+/g, '<url>'],
  [/(["'`]).*?\1/g, '<str>'],
  [/\b(?=[\w-]*\d)(?=[\w-]*[a-z])[\w-]{6,}\b/gi, '<id>'],
  [/\b\d+(\.\d+)?\b/g, '<n>']
]
const MAX_RAW_MESSAGE_LENGTH = 1000
const MAX_NORMALIZED_MESSAGE_LENGTH = 300
const STACK_FRAME = /^\s*at (?:async )?(?:new )?([^\s(]+)(?: \[as [^\]]+\])? \((.+)\)$/
const NON_APP_FRAME = /node:internal|node_modules|\/utils\/(Logger|logError)\.|^native$/
const FNV_OFFSET_BASIS = BigInt('0xcbf29ce484222325')
const FNV_PRIME = BigInt('0x100000001b3')
const UINT64_MASK = BigInt('0xffffffffffffffff')
const textEncoder = new TextEncoder()

const hashFnv1a64 = (text: string) => {
  let hash = FNV_OFFSET_BASIS
  for (const byte of textEncoder.encode(text)) {
    hash = ((hash ^ BigInt(byte)) * FNV_PRIME) & UINT64_MASK
  }
  return hash.toString(16).padStart(16, '0')
}

export const normalizeErrorMessage = (message: string) =>
  MESSAGE_NORMALIZERS.reduce(
    (normalized, [pattern, replacement]) => normalized.replace(pattern, replacement),
    message.slice(0, MAX_RAW_MESSAGE_LENGTH)
  ).slice(0, MAX_NORMALIZED_MESSAGE_LENGTH)

export const getTopAppFrameFunction = (stack: string | undefined) => {
  for (const line of stack?.split('\n') ?? []) {
    const frame = line.match(STACK_FRAME)
    if (frame && !NON_APP_FRAME.test(frame[2]!)) return frame[1]
  }
  return undefined
}

const getErrorFingerprint = (service: string, error: Error) => {
  const parts = [
    service,
    error.name,
    normalizeErrorMessage(error.message),
    getTopAppFrameFunction(error.stack) ?? ''
  ]
  return hashFnv1a64(parts.join('|'))
}

export default getErrorFingerprint
