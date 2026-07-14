// Stub for `babel-plugin-relay/macro` used ONLY by the design-sync esbuild
// bundle. The real macro is a build-time (webpack/babel) transform that
// rewrites graphql`…` into a require() of a pre-compiled __generated__ artifact
// (a ConcreteRequest / ReaderFragment). esbuild can't run it, and pulling the
// real package in drags Node-only deps (cosmiconfig, fs, path) into a browser
// bundle.
//
// A pure no-op won't do: several modules (mutations, subscriptions) call
// `getRequest(graphql`…`)` at MODULE scope, and relay's getRequest throws
// "Expected a request" on anything whose `.kind` isn't 'Request' — that throw
// aborts the whole IIFE, so even unrelated primitives fail to initialize.
//
// So the stub returns a structurally-valid-ENOUGH node: the right `kind` and a
// `params` carrying the operation name parsed from the tag. That satisfies the
// module-load structural checks. The presentational components this bundle
// cards never actually execute a query/fragment during static preview
// rendering, so the empty selections are never read.
const OP_RX = /\b(query|mutation|subscription|fragment)\s+(\w+)/

type Stub = Record<string, unknown>

const graphql = (strings: TemplateStringsArray, ..._values: unknown[]): Stub => {
  const src = (strings && (strings[0] ?? (strings as unknown as {raw?: string[]}).raw?.[0])) || ''
  const m = OP_RX.exec(src)
  const keyword = m?.[1] ?? 'query'
  const name = m?.[2] ?? 'DesignSyncStub'
  const emptyFragment = {
    kind: 'Fragment',
    name,
    type: 'Unknown',
    metadata: null,
    argumentDefinitions: [],
    selections: []
  }
  if (keyword === 'fragment') return emptyFragment
  return {
    kind: 'Request',
    fragment: emptyFragment,
    operation: {kind: 'Operation', name, argumentDefinitions: [], selections: []},
    params: {
      id: null,
      cacheID: name,
      metadata: {},
      name,
      operationKind: keyword === 'mutation' ? 'mutation' : keyword === 'subscription' ? 'subscription' : 'query',
      text: src
    }
  }
}
export default graphql
export {graphql}
