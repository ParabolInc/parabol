import areEqual from 'fbjs/lib/areEqual'
import {useEffect, useRef} from 'react'
import {PreloadableConcreteRequest, PreloadFetchPolicy, useQueryLoader} from 'react-relay'
import {GraphQLTaggedNode, OperationType, VariablesOf} from 'relay-runtime'
import useAtmosphere from './useAtmosphere'

const useQueryLoaderNow = <TQuery extends OperationType>(
  preloadableRequest: GraphQLTaggedNode | PreloadableConcreteRequest<TQuery>,
  variables: VariablesOf<TQuery> = {},
  fetchPolicy?: PreloadFetchPolicy
) => {
  const [queryRef, loadQuery] = useQueryLoader<TQuery>(preloadableRequest)
  const varRef = useRef(variables)
  const atmosphere = useAtmosphere()
  if (!areEqual(variables, varRef.current)) {
    varRef.current = variables
  }
  // refetch when variables change
  useEffect(() => {
    loadQuery(variables || {}, {fetchPolicy: 'store-or-network'})
  }, [varRef.current])

  // refetch when reconnected to server
  useEffect(() => {
    const refresh = () => {
      loadQuery(variables || {}, {fetchPolicy: fetchPolicy || 'store-or-network'})
    }
    atmosphere.retries.add(refresh)
    return () => {
      atmosphere.retries.delete(refresh)
    }
  }, [])

  return queryRef
}

export default useQueryLoaderNow
