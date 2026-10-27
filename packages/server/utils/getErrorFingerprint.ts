import {createHash} from 'node:crypto'

const MESSAGE_NORMALIZERS: [RegExp, string][] = [
  [/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '<uuid>'],
  [/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '<email>'],
  [/\bhttps?:\/\/\S+/g, '<url>'],
  [/(["'`]).*?\1/g, '<str>'],
  [/\b(?=[\w-]*\d)(?=[\w-]*[a-z])[\w-]{6,}\b/gi, '<id>'],
  [/\b\d+(\.\d+)?\b/g, '<n>']
]
const MAX_NORMALIZED_MESSAGE_LENGTH = 300
const STACK_FRAME = /^\s*at (?:async )?(?:new )?([^\s(]+)(?: \[as [^\]]+\])? \((.+)\)$/
const NON_APP_FRAME = /node:internal|node_modules|\/utils\/(Logger|logError)\.|^native$/

export const normalizeErrorMessage = (message: string) =>
  MESSAGE_NORMALIZERS.reduce(
    (normalized, [pattern, replacement]) => normalized.replace(pattern, replacement),
    message
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
  return createHash('sha1').update(parts.join('|')).digest('hex').slice(0, 16)
}

export default getErrorFingerprint
