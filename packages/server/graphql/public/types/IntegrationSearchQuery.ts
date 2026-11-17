import {CipherId} from '../../../utils/CipherId'
import type {IntegrationSearchQueryResolvers} from '../resolverTypes'

const IntegrationSearchQuery: IntegrationSearchQueryResolvers = {
  id: ({id}) => CipherId.toClient(id, 'integrationSearchQuery'),
  queryString: ({query}) => query.queryString,
  meta: ({query}) => {
    const {queryString: _queryString, ...meta} = query
    return JSON.stringify(meta)
  }
}

export default IntegrationSearchQuery
