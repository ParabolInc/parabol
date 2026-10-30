import areEqual from 'fbjs/lib/areEqual'
import {startTransition, useCallback, useEffect, useRef, useState} from 'react'
import {fetchQuery, type PreloadFetchPolicy, useQueryLoader} from 'react-relay'
import type {ConcreteRequest, GraphQLTaggedNode, OperationType, VariablesOf} from 'relay-runtime'
import useAtmosphere from './useAtmosphere'

type QueryLoaderOptions = {
  fetchPolicy?: PreloadFetchPolicy
  preventSuspense?: boolean
  transition?: boolean
}

export const useQueryLoaderNowWithRetry = <TQuery extends OperationType>(
  preloadableRequest: GraphQLTaggedNode | ConcreteRequest,
  variables: VariablesOf<TQuery> = {},
  options: QueryLoaderOptions = {}
) => {
  const {fetchPolicy, preventSuspense, transition} = options
  const [queryRef, loadQuery] = useQueryLoader<TQuery>(preloadableRequest)
  const [error, setError] = useState<Error | null>(null)
  const varRef = useRef(variables)
  const atmosphere = useAtmosphere()
  if (!areEqual(variables, varRef.current)) {
    varRef.current = variables
  }

  const refreshQuery = useCallback(() => {
    // fetchQuery will fetch the query and write the data to the Relay store. This will
    // ensure that when we re-render, the data is already cached and we don't suspend
    // a fetch for variables that have since changed would replace newer results with older ones
    const isCurrent = () => areEqual(variables, varRef.current)
    setError(null)
    fetchQuery(atmosphere, preloadableRequest as GraphQLTaggedNode, variables).subscribe({
      complete: () => {
        // *After* the query has been fetched, we call loadQuery again to re-render
        // with a new queryRef. At this point the data for the query should be
        // cached, so we use the 'store-only' fetchPolicy to avoid suspending.
        if (!isCurrent()) return
        loadQuery(variables, {
          fetchPolicy: 'store-only' as PreloadFetchPolicy
        })
      },
      // the previous results stay up, so a failed fetch says so, or they'd pass for the results of these variables
      error: (fetchError: Error) => {
        if (isCurrent()) setError(fetchError)
      }
    })
  }, [varRef.current])

  // refetch when variables change
  useEffect(() => {
    if (preventSuspense) refreshQuery()
    else {
      const load = () =>
        loadQuery(variables || {}, {
          fetchPolicy: fetchPolicy || 'store-or-network'
        })
      if (transition) startTransition(load)
      else load()
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

  return {queryRef, retry: refreshQuery, error}
}

const useQueryLoaderNow = <TQuery extends OperationType>(
  preloadableRequest: GraphQLTaggedNode | ConcreteRequest,
  variables: VariablesOf<TQuery> = {},
  fetchPolicy?: PreloadFetchPolicy,
  preventSuspense?: boolean
) => {
  const {queryRef} = useQueryLoaderNowWithRetry(preloadableRequest, variables, {
    fetchPolicy,
    preventSuspense
  })
  return queryRef
}

export default useQueryLoaderNow
