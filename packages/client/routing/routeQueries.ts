import {loadQuery, type PreloadedQuery} from 'react-relay'
import type {ConcreteRequest, IEnvironment, OperationType, VariablesOf} from 'relay-runtime'

// Long enough for the legacy roots to mount and retain the data themselves
const RETAIN_MS = 60_000
// A navigation keeps the old screen up for at most this long while the new page's code & data arrive
const HOLD_MS = 300

type PreloadableComponent = {preload?: () => Promise<void> | undefined}

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

export const holdForPage = async (
  refs: PreloadedQuery<OperationType>[],
  components: PreloadableComponent[]
) => {
  const firstPayloads = refs.map((ref) => ref.source?.toPromise().catch(() => undefined))
  const code = components.map((component) => component.preload?.())
  await Promise.race([
    Promise.all([...firstPayloads, ...code]),
    new Promise((resolve) => setTimeout(resolve, HOLD_MS))
  ])
}
