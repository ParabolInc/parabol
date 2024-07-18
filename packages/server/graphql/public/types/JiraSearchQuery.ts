import {JiraSearchQueryResolvers} from '../resolverTypes'

const JiraSearchQuery: JiraSearchQueryResolvers = {
  id: ({id}) => `JiraSearchQuery:${id}`,
  projectKeyFilters: ({projectKeyFilters}) => projectKeyFilters || []
}

export default JiraSearchQuery
