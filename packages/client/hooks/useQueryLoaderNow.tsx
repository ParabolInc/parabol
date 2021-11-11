import areEqual from 'fbjs/lib/areEqual'
import {useCallback, useEffect, useRef} from 'react'
import {
  fetchQuery,
  PreloadableConcreteRequest,
  PreloadFetchPolicy,
  useQueryLoader,
  useRelayEnvironment
} from 'react-relay'
import {GraphQLTaggedNode, OperationType, VariablesOf} from 'relay-runtime'
import useAtmosphere from './useAtmosphere'

const useQueryLoaderNow = <TQuery extends OperationType>(
  preloadableRequest: GraphQLTaggedNode | PreloadableConcreteRequest<TQuery>,
  variables: VariablesOf<TQuery> = {},
  fetchPolicy?: PreloadFetchPolicy,
  preventSuspense?: boolean
) => {
  const [queryRef, loadQuery] = useQueryLoader<TQuery>(preloadableRequest)
  const varRef = useRef(variables)
  const atmosphere = useAtmosphere()
  const environment = useRelayEnvironment()
  if (!areEqual(variables, varRef.current)) {
    varRef.current = variables
  }

  const refreshQuery = useCallback(() => {
    // fetchQuery will fetch the query and write the data to the Relay store. This will
    // ensure that when we re-render, the data is already cached and we don't suspend
    fetchQuery(environment, preloadableRequest as GraphQLTaggedNode, variables).subscribe({
      complete: () => {
        // *After* the query has been fetched, we call loadQuery again to re-render
        // with a new queryRef. At this point the data for the query should be
        // cached, so we use the 'store-only' fetchPolicy to avoid suspending.
        loadQuery(variables, {fetchPolicy: 'store-only' as PreloadFetchPolicy})
      }
    })
  }, [varRef.current])

  // refetch when variables change
  useEffect(() => {
    if (preventSuspense) refreshQuery()
    else {
      loadQuery(variables || {}, {fetchPolicy: fetchPolicy || 'store-or-network'})
    }
  }, [varRef.current])

  // refetch when reconnected to server
  useEffect(() => {
    const refresh = () => {
      loadQuery(varRef.current, {fetchPolicy: 'network-only'})
    }
    atmosphere.retries.add(refresh)
    return () => {
      atmosphere.retries.delete(refresh)
    }
  }, [])

  return queryRef
}

export default useQueryLoaderNow
