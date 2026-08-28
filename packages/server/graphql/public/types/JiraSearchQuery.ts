import IntegrationSearchQueryId from '../../../../client/shared/gqlIds/IntegrationSearchQueryId'
import type {JiraSearchQueryResolvers} from '../resolverTypes'

const JiraSearchQuery: JiraSearchQueryResolvers = {
  id: ({id}) => IntegrationSearchQueryId.join('JiraSearchQuery', id),
  queryString: ({query}) => query.queryString,
  isJQL: ({service, query}) => service !== 'github' && query.isJQL,
  projectKeyFilters: ({service, query}) =>
    service === 'github' ? [] : (query.projectKeyFilters ?? [])
}

export default JiraSearchQuery
