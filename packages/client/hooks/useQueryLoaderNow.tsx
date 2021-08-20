import {useEffect} from 'react'
import {PreloadableConcreteRequest, useQueryLoader} from 'react-relay'
import {GraphQLTaggedNode, OperationType, VariablesOf} from 'relay-runtime'
import useDeepEqual from './useDeepEqual'

const useQueryLoaderNow = <TQuery extends OperationType>(
  preloadableRequest: GraphQLTaggedNode | PreloadableConcreteRequest<TQuery>,
  variables?: VariablesOf<TQuery>
) => {
  const [queryRef, loadQuery] = useQueryLoader<TQuery>(preloadableRequest)
  const memoVars = useDeepEqual(variables)
  useEffect(() => {
    loadQuery(variables || {}, {fetchPolicy: 'store-or-network'})
  }, [memoVars])
  return queryRef
}

export default useQueryLoaderNow
