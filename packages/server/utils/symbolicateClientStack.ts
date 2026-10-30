import fs from 'node:fs/promises'
import path from 'node:path'
import {originalPositionFor, TraceMap} from '@jridgewell/trace-mapping'
import ErrorStackParser from 'error-stack-parser'
import getProjectRoot from '../../../scripts/webpack/utils/getProjectRoot'

const BUILD_DIR = path.join(getProjectRoot(), 'build')
const {CDN_BASE_URL, PROXY_CDN} = process.env
// PPMIs that proxy the CDN keep their bucket private, so older releases' maps only come from a public CDN
const CDN_BUILD_URL =
  CDN_BASE_URL && PROXY_CDN !== 'true'
    ? `${CDN_BASE_URL.replace(/^\/{2,}/, 'https://')}/build/`
    : undefined
const BUILD_FILE = /\/(?:build|static)\/([\w.-]+\.js)(?:\?[^/]*)?$/
const MAX_FRAMES = 50
const MAX_CACHED_SOURCE_MAPS = 20
const MAX_SOURCE_MAP_BYTES = 50 * 1024 * 1024
const MISSING_SOURCE_MAP_RETRY_MS = 5 * 60 * 1000
const CDN_TIMEOUT_MS = 5000

interface SourceMapEntry {
  sourceMap: Promise<TraceMap | null>
  missingSince?: number
}

const sourceMapCache = new Map<string, SourceMapEntry>()

const readCdnSourceMap = async (fileName: string) => {
  if (!CDN_BUILD_URL) return null
  const res = await fetch(`${CDN_BUILD_URL}${fileName}.map`, {
    signal: AbortSignal.timeout(CDN_TIMEOUT_MS)
  }).catch(() => null)
  if (!res?.ok || Number(res.headers.get('content-length')) > MAX_SOURCE_MAP_BYTES) return null
  const text = await res.text().catch(() => null)
  return text && text.length <= MAX_SOURCE_MAP_BYTES ? text : null
}

const loadSourceMap = async (fileName: string, buildDir: string) => {
  const text =
    (await fs.readFile(path.join(buildDir, `${fileName}.map`), 'utf8').catch(() => null)) ??
    (await readCdnSourceMap(fileName))
  if (!text) return null
  try {
    return new TraceMap(text)
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

const symbolicateFrame = async (frame: ErrorStackParser.StackFrame, buildDir: string) => {
  const {functionName, fileName, lineNumber, columnNumber} = frame
  const buildFileName = fileName?.match(BUILD_FILE)?.[1]
  if (buildFileName && lineNumber && columnNumber) {
    const sourceMap = await getSourceMap(buildFileName, buildDir)
    const original =
      sourceMap && originalPositionFor(sourceMap, {line: lineNumber, column: columnNumber - 1})
    if (original?.source) {
      const location = `${toSourcePath(original.source)}:${original.line}:${original.column + 1}`
      return formatFrame(original.name ?? functionName, location)
    }
  }
  const location = [fileName, lineNumber, columnNumber].filter((part) => part !== undefined)
  return formatFrame(functionName, location.join(':'))
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
  const error = new Error(message)
  error.name = name
  error.stack = stack
  let frames: ErrorStackParser.StackFrame[]
  try {
    frames = ErrorStackParser.parse(error)
      .filter((frame) => frame.fileName)
      .slice(0, MAX_FRAMES)
  } catch {
    return stack
  }
  if (frames.length === 0) return stack
  const lines = await Promise.all(frames.map((frame) => symbolicateFrame(frame, buildDir)))
  return [header, ...lines].join('\n')
}

export default symbolicateClientStack
