import {loadQuery, type PreloadedQuery} from 'react-relay'
import type {ConcreteRequest, IEnvironment, OperationType, VariablesOf} from 'relay-runtime'

// Long enough for the route's root component to mount and retain the data itself
const RETAIN_MS = 60_000
// A navigation keeps the old screen up for at most this long while the new page's data arrives
const HOLD_MS = 300

const retained = new Map<string, PreloadedQuery<OperationType>>()

export const loadRouteQuery = <TQuery extends OperationType>(
  environment: IEnvironment,
  query: ConcreteRequest,
  variables: VariablesOf<TQuery>
) => {
  const key = `${query.params.name}:${JSON.stringify(variables)}`
  const existing = retained.get(key)
  if (existing && !existing.isDisposed) return existing
  const ref = loadQuery<TQuery>(environment, query, variables, {fetchPolicy: 'store-or-network'})
  retained.set(key, ref)
  setTimeout(() => {
    ref.dispose()
    if (retained.get(key) === ref) retained.delete(key)
  }, RETAIN_MS)
  return ref
}

// The router loads each route's code beside its loaders, so a loader only has to wait for its data
export const holdForData = async (refs: PreloadedQuery<OperationType>[]) => {
  const firstPayloads = refs.map((ref) => ref.source?.toPromise().catch(() => undefined))
  await Promise.race([
    Promise.all(firstPayloads),
    new Promise((resolve) => setTimeout(resolve, HOLD_MS))
  ])
}
