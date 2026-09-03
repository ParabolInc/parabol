import IntegrationSearchQueryId from '../../../../client/shared/gqlIds/IntegrationSearchQueryId'
import type {GitHubSearchQueryResolvers} from '../resolverTypes'

const GitHubSearchQuery: GitHubSearchQueryResolvers = {
  id: ({id}) => IntegrationSearchQueryId.join('GitHubSearchQuery', id),
  queryString: ({query}) => query.queryString
}

export default GitHubSearchQuery
