const CASE_SEGMENT = /[A-Z]{2,}s\b|[A-Z]+(?![a-z])|[A-Z]?[a-z]+/g
const VOWELLESS_ABBREVIATIONS = new Set([
  'cb',
  'csv',
  'ctx',
  'dm',
  'fn',
  'html',
  'http',
  'js',
  'md',
  'msg',
  'pdf',
  'png',
  'src',
  'str',
  'svg',
  'xml'
])

// About 1 in 6 generated ids has no digit, like UZoObZMXvy. Split at case changes, an id has pieces no identifier has
// (a lone capital mid-token, or letters with no vowel) or many two-letter ones. getElementById and existingIDs pass
export const isLetterOnlyId = (token: string) => {
  if (!/[a-z]/.test(token) || !/[A-Z]/.test(token)) return false
  const segments = token.match(CASE_SEGMENT) ?? []
  let unpronounceableCount = 0
  let twoLetterCount = 0
  segments.forEach((segment, index) => {
    if (segment.length === 1) {
      if (index < segments.length - 1) unpronounceableCount++
    } else if (
      /[a-z]/.test(segment) &&
      !/[aeiouy]/i.test(segment) &&
      !VOWELLESS_ABBREVIATIONS.has(segment.toLowerCase())
    ) {
      unpronounceableCount++
    } else if (segment.length === 2) {
      twoLetterCount++
    }
  })
  const vowelCount = token.match(/[aeiou]/gi)?.length ?? 0
  return (
    unpronounceableCount * 2 + twoLetterCount >= 4 ||
    (unpronounceableCount >= 1 && vowelCount * 5 <= token.length)
  )
}

const MESSAGE_NORMALIZERS: [RegExp, string | ((token: string) => string)][] = [
  [/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '<uuid>'],
  [/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '<email>'],
  [/\bhttps?:\/\/\S+/g, '<url>'],
  [/(["'`]).*?\1/g, '<str>'],
  [/\b(?=[\w-]*\d)(?=[\w-]*[a-z])[\w-]{6,}\b/gi, '<id>'],
  [/\b[a-z]{8,}\b/gi, (token) => (isLetterOnlyId(token) ? '<id>' : token)],
  [/\b\d+(\.\d+)?\b/g, '<n>']
]
const MAX_RAW_MESSAGE_LENGTH = 1000
const MAX_NORMALIZED_MESSAGE_LENGTH = 300
const STACK_FRAME = /^\s*at (?:async )?(?:new )?([^\s(]+)(?: \[as [^\]]+\])? \((.+)\)$/
const NON_APP_FRAME = /node:internal|node_modules|\/utils\/(Logger|logError)\.|^native$/
// A browser's stack also holds the reporter's own frames, webpack's runtime and scripts an extension injected.
// Their names change with the browser, the release or the extension, so taking one splits an error into many.
// Only browser stacks skip them, so a server error keeps its fingerprint and its issue
const NON_APP_CLIENT_FRAME =
  /\/utils\/(reportClientError|registerClientErrorHandlers)\.|^webpack\/runtime\/|^<anonymous>|^[\w-]+-extension:/
export const CLIENT_LOG_SERVICE = 'parabol-client'
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
    (normalized, [pattern, replacement]) =>
      typeof replacement === 'string'
        ? normalized.replace(pattern, replacement)
        : normalized.replace(pattern, replacement),
    message.slice(0, MAX_RAW_MESSAGE_LENGTH)
  ).slice(0, MAX_NORMALIZED_MESSAGE_LENGTH)

const isAppFrame = (location: string, service: string | undefined) =>
  !NON_APP_FRAME.test(location) &&
  (service !== CLIENT_LOG_SERVICE || !NON_APP_CLIENT_FRAME.test(location))

export const getTopAppFrameFunction = (stack: string | undefined, service?: string) => {
  for (const line of stack?.split('\n') ?? []) {
    const frame = line.match(STACK_FRAME)
    if (frame && isAppFrame(frame[2]!, service)) return frame[1]
  }
  return undefined
}

const getErrorFingerprint = (service: string, error: Error) => {
  const parts = [
    service,
    error.name,
    normalizeErrorMessage(error.message),
    getTopAppFrameFunction(error.stack, service) ?? ''
  ]
  return hashFnv1a64(parts.join('|'))
}

export default getErrorFingerprint
