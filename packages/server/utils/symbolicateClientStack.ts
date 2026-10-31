import fs from 'node:fs/promises'
import {SourceMap} from 'node:module'
import path from 'node:path'
import getProjectRoot from '../../../scripts/webpack/utils/getProjectRoot'

const BUILD_DIR = path.join(getProjectRoot(), 'build')
const {CDN_BASE_URL, PROXY_CDN} = process.env
// PPMIs that proxy the CDN keep their bucket private, so older releases' maps only come from a public CDN
const CDN_BUILD_URL =
  CDN_BASE_URL && PROXY_CDN !== 'true'
    ? `${CDN_BASE_URL.replace(/^\/{2,}/, 'https://')}/build/`
    : undefined
const BUILD_FILE = /\/(?:build|static)\/([\w.-]+\.js)(?:\?[^/]*)?$/
// Chrome: "    at fn (url:line:column)" or "    at url:line:column". Firefox and Safari: "fn@url:line:column"
const V8_FRAME = /^\s*at (?:async )?(?:(.+?) \()?(.+?):(\d+):(\d+)\)?$/
const GECKO_FRAME = /^(?:(.*?)@)?(.+?):(\d+):(\d+)$/
const MAX_FRAMES = 50
const MAX_CACHED_SOURCE_MAPS = 20
const MAX_SOURCE_MAP_BYTES = 50 * 1024 * 1024
const MISSING_SOURCE_MAP_RETRY_MS = 5 * 60 * 1000
const CDN_TIMEOUT_MS = 5000

interface StackFrame {
  functionName?: string
  fileName: string
  lineNumber: number
  columnNumber: number
}

interface SourceMapEntry {
  sourceMap: Promise<SourceMap | null>
  missingSince?: number
}

const sourceMapCache = new Map<string, SourceMapEntry>()

const matchFrames = (lines: string[], pattern: RegExp) =>
  lines.map((line) => line.match(pattern)).filter((match): match is RegExpMatchArray => !!match)

// A Chrome stack starts with the error's message, which must not be mistaken for a frame
const parseStackFrames = (stack: string): StackFrame[] => {
  const lines = stack.split('\n')
  const v8Frames = matchFrames(lines, V8_FRAME)
  const frames = v8Frames.length > 0 ? v8Frames : matchFrames(lines, GECKO_FRAME)
  return frames.map(([, functionName, fileName = '', lineNumber, columnNumber]) => ({
    functionName: functionName || undefined,
    fileName,
    lineNumber: Number(lineNumber),
    columnNumber: Number(columnNumber)
  }))
}

const readCdnSourceMap = async (fileName: string) => {
  if (!CDN_BUILD_URL) return null
  const res = await fetch(`${CDN_BUILD_URL}${fileName}.map`, {
    signal: AbortSignal.timeout(CDN_TIMEOUT_MS)
  }).catch(() => null)
  if (!res?.ok || Number(res.headers.get('content-length')) > MAX_SOURCE_MAP_BYTES) return null
  const text = await res.text().catch(() => null)
  return text && text.length <= MAX_SOURCE_MAP_BYTES ? text : null
}

// node:module's SourceMap is still marked experimental; symbolicateClientStack.test.ts pins what we rely on
const loadSourceMap = async (fileName: string, buildDir: string) => {
  const text =
    (await fs.readFile(path.join(buildDir, `${fileName}.map`), 'utf8').catch(() => null)) ??
    (await readCdnSourceMap(fileName))
  if (!text) return null
  try {
    return new SourceMap(JSON.parse(text))
  } catch {
    return null
  }
}

const getSourceMap = (fileName: string, buildDir: string) => {
  const key = path.join(buildDir, fileName)
  const cached = sourceMapCache.get(key)
  sourceMapCache.delete(key)
  const isRetryDue =
    cached?.missingSince !== undefined &&
    Date.now() - cached.missingSince > MISSING_SOURCE_MAP_RETRY_MS
  if (cached && !isRetryDue) {
    sourceMapCache.set(key, cached)
    return cached.sourceMap
  }
  const entry: SourceMapEntry = {
    sourceMap: loadSourceMap(fileName, buildDir).then((sourceMap) => {
      if (!sourceMap) entry.missingSince = Date.now()
      return sourceMap
    })
  }
  sourceMapCache.set(key, entry)
  if (sourceMapCache.size > MAX_CACHED_SOURCE_MAPS) {
    sourceMapCache.delete(sourceMapCache.keys().next().value!)
  }
  return entry.sourceMap
}

const toSourcePath = (source: string) =>
  source.replace(/^webpack:\/\/[^/]*\//, '').replace(/^\.\//, '')

const formatFrame = (functionName: string | undefined, location: string) =>
  functionName ? `    at ${functionName} (${location})` : `    at ${location}`

const symbolicateFrame = async (frame: StackFrame, buildDir: string) => {
  const {functionName, fileName, lineNumber, columnNumber} = frame
  const buildFileName = fileName.match(BUILD_FILE)?.[1]
  const sourceMap = buildFileName ? await getSourceMap(buildFileName, buildDir) : null
  // findOrigin takes and returns 1-based lines and columns, like the stack itself
  const origin = sourceMap?.findOrigin(lineNumber, columnNumber)
  if (origin && 'fileName' in origin) {
    const location = `${toSourcePath(origin.fileName)}:${origin.lineNumber}:${origin.columnNumber}`
    return formatFrame(origin.name || functionName, location)
  }
  return formatFrame(functionName, `${fileName}:${lineNumber}:${columnNumber}`)
}

// Returns a V8-format stack, which is what Error Reporting groups by and what the logger fingerprints
const symbolicateClientStack = async (
  name: string,
  message: string,
  stack: string | undefined,
  buildDir = BUILD_DIR
) => {
  const header = `${name}: ${message}`
  if (!stack) return header
  const frames = parseStackFrames(stack).slice(0, MAX_FRAMES)
  if (frames.length === 0) return stack
  const lines = await Promise.all(frames.map((frame) => symbolicateFrame(frame, buildDir)))
  return [header, ...lines].join('\n')
}

export default symbolicateClientStack
