import CompactSourceMap from './utils/CompactSourceMap'

// Stands in for `node --enable-source-maps`, whose source map costs ~180MB of heap from the first stack trace on
// A stack trace hook of our own also keeps node from loading its source map where that flag is still set
let sourceMap: CompactSourceMap | null | undefined

const getSourceMap = () => {
  if (sourceMap === undefined) {
    try {
      sourceMap = new CompactSourceMap(`${__filename}.map`)
    } catch {
      sourceMap = null
    }
  }
  return sourceMap
}

// node's own errors print as `name [code]: message`. Only a symbol its internals hold tells them apart
const isNodeError = (error: object) => {
  for (let target: object | null = error; target; target = Object.getPrototypeOf(target)) {
    const symbols = Object.getOwnPropertySymbols(target)
    if (symbols.some((symbol) => symbol.description === 'kIsNodeError')) return true
  }
  return false
}

const getErrorHeader = (error: Error & {code?: unknown}) => {
  try {
    if (isNodeError(error)) return `${error.name} [${error.code}]: ${error.message}`
    return Error.prototype.toString.call(error)
  } catch {
    return '<error>'
  }
}

// A call site counts lines & columns from 1 and has none for native code, which then maps to nothing
const toZeroBased = (oneBased: number | null) => (oneBased ?? 0) - 1

const findOriginalName = (
  compactSourceMap: CompactSourceMap,
  callSite: NodeJS.CallSite,
  callerCallSite: NodeJS.CallSite | undefined
) => {
  const enclosingPosition = compactSourceMap.findOriginalPosition(
    toZeroBased(callSite.getEnclosingLineNumber()),
    toZeroBased(callSite.getEnclosingColumnNumber())
  )
  if (enclosingPosition?.name) return enclosingPosition.name
  if (callerCallSite?.getFileName() !== callSite.getFileName()) return undefined
  return compactSourceMap.findOriginalPosition(
    toZeroBased(callerCallSite.getLineNumber()),
    toZeroBased(callerCallSite.getColumnNumber())
  )?.name
}

// The frame as node's lib/internal/source_map/prepare_stack_trace.js writes it
const formatFrame = (
  compactSourceMap: CompactSourceMap,
  callSite: NodeJS.CallSite,
  callerCallSite: NodeJS.CallSite | undefined
) => {
  const position = compactSourceMap.findOriginalPosition(
    toZeroBased(callSite.getLineNumber()),
    toZeroBased(callSite.getColumnNumber())
  )
  if (!position) return `${callSite}`
  const originalName = findOriginalName(compactSourceMap, callSite, callerCallSite)
  const functionName = callSite.getFunctionName() ?? callSite.getMethodName()
  const callPrefix = callSite.isAsync() ? 'async ' : callSite.isConstructor() ? 'new ' : ''
  const typeName = callSite.getTypeName()
  const typePrefix = typeName !== null && typeName !== 'global' ? `${typeName}.` : ''
  const name = originalName || functionName || '<anonymous>'
  const location = `${position.source}:${position.line + 1}:${position.column + 1}`
  return `${callPrefix}${typePrefix}${name} (${location})`
}

Error.prepareStackTrace = (error, callSites) => {
  const header = getErrorHeader(error)
  if (callSites.length === 0) return header
  const frames = callSites.map((callSite, index) => {
    try {
      if (callSite.getFileName() === __filename) {
        const compactSourceMap = getSourceMap()
        if (compactSourceMap) return formatFrame(compactSourceMap, callSite, callSites[index + 1])
      }
    } catch {
      // an unmapped frame is better than a stack trace that throws
    }
    return `${callSite}`
  })
  return `${header}\n    at ${frames.join('\n    at ')}`
}
