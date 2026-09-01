import IntegrationSearchQueryId from '../../../../client/shared/gqlIds/IntegrationSearchQueryId'
import type {JiraSearchQueryResolvers} from '../resolverTypes'

const JiraSearchQuery: JiraSearchQueryResolvers = {
  id: ({id}) => IntegrationSearchQueryId.join('JiraSearchQuery', id),
  queryString: ({query}) => query.queryString,
  isJQL: ({query}) => query.isJQL,
  projectKeyFilters: ({query}) => query.projectKeyFilters ?? []
}

export default JiraSearchQuery
