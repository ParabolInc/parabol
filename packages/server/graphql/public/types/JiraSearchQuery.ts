import type {JiraSearchQueryResolvers} from '../resolverTypes'

const JiraSearchQuery: JiraSearchQueryResolvers = {
  id: ({id}) => `JiraSearchQuery:${id}`,
  projectKeyFilters: ({projectKeyFilters}) => projectKeyFilters || [],
  lastUsedAt: async ({lastUsedAt}) => {
    return new Date(lastUsedAt)
  }
}

export default JiraSearchQuery
