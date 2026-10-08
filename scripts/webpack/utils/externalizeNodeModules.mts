import type {ExternalItemFunctionData} from '@rspack/core'
import {createRequire} from 'module'
import path from 'path'

const NODE_MODULES = `${path.sep}node_modules${path.sep}`
const requireByContext = new Map<string, NodeJS.Require>()

// Leaves every dependency that node can require by itself out of the bundle, so webpack only compiles our own code
// The external is an absolute path because pnpm does not hoist the dependencies of a workspace package to the root
// A dependency that node cannot require (e.g. it only exports ESM) is bundled instead
const externalizeNodeModules = (
  {context, request}: ExternalItemFunctionData,
  callback: (error?: Error, result?: string) => void
) => {
  if (!context || !request || request.startsWith('.') || path.isAbsolute(request)) {
    return callback()
  }
  let requireFromContext = requireByContext.get(context)
  if (!requireFromContext) {
    requireFromContext = createRequire(path.join(context, 'index.js'))
    requireByContext.set(context, requireFromContext)
  }
  let resolved: string
  try {
    resolved = requireFromContext.resolve(request)
  } catch {
    return callback()
  }
  if (!resolved.includes(NODE_MODULES)) return callback()
  callback(undefined, `commonjs ${resolved}`)
}

export default externalizeNodeModules
