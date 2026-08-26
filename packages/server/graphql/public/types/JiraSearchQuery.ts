import IntegrationSearchQueryId from '../../../../client/shared/gqlIds/IntegrationSearchQueryId'
import type {JiraSearchQueryResolvers} from '../resolverTypes'

const JiraSearchQuery: JiraSearchQueryResolvers = {
  id: ({id}) => IntegrationSearchQueryId.join('JiraSearchQuery', id),
  projectKeyFilters: ({projectKeyFilters}) => projectKeyFilters || [],
  lastUsedAt: async ({lastUsedAt}) => {
    return new Date(lastUsedAt)
  }
}

export default JiraSearchQuery
