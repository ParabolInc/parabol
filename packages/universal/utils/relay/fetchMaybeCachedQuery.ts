/*
 * Tries grabbing the query locally & if not found, then fetches it
 * Not sure why Relay retains the one-off queries, and it may change in the future, but nice for now
 */

import {fetchQuery, getRequest, GraphQLTaggedNode} from 'relay-runtime'
import Atmosphere from '../../Atmosphere'

const fetchMaybeCachedQuery = async (
  atmosphere: Atmosphere,
  taggedNode: GraphQLTaggedNode,
  variables: any
) => {
  const {createOperationDescriptor} = atmosphere.unstable_internal
  const operation = createOperationDescriptor(getRequest(taggedNode), variables)
  if (atmosphere.check(operation.root)) {
    return atmosphere.lookup(operation.fragment, operation).data
  }
  return fetchQuery(atmosphere, taggedNode, variables)
}

export default fetchMaybeCachedQuery
