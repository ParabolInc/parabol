// @ts-nocheck
// react-relay stub for the design-sync bundle ONLY (aliased via
// .design-sync/tsconfig.ds.json). It re-exports the REAL react-relay for
// everything (RelayEnvironmentProvider, commitMutation, useRelayEnvironment,
// …) and overrides the READ hooks to be pass-through, so a [relay] component
// renders directly from a plain data object passed as its "ref" prop in a
// design-sync preview — no live GraphQL store needed.
//
// The real package is imported via the "react-relay/index.js" subpath, which
// the exact-match alias ("react-relay") does NOT intercept, so there's no
// recursion. Presentational (non-relay) components never call these hooks, so
// this alias is inert for them.
export * from 'react-relay/index.js'
import * as real from 'react-relay/index.js'

// useFragment(fragmentNode, ref) → ref: the preview passes the fragment's
// $data shape directly as the ref, so `const x = useFragment(…, ref)` === ref.
export const useFragment = (_fragment, ref) => ref
export const usePreloadedQuery = (_query, ref) => ref
export const useLazyLoadQuery = (_query, variables) => variables ?? {}
export const useRefetchableFragment = (_fragment, ref) => [ref, () => {}]
export const usePaginationFragment = (_fragment, ref) => ({
  data: ref,
  loadNext: () => {},
  loadPrevious: () => {},
  hasNext: false,
  hasPrevious: false,
  isLoadingNext: false,
  isLoadingPrevious: false,
  refetch: () => {}
})

const _default = real.default ?? real
export default _default
