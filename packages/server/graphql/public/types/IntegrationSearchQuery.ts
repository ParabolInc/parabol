import type {IntegrationSearchQueryResolvers} from '../resolverTypes'

const IntegrationSearchQuery: IntegrationSearchQueryResolvers = {
  __resolveType: ({service}) => (service === 'github' ? 'GitHubSearchQuery' : 'JiraSearchQuery')
}

export default IntegrationSearchQuery
