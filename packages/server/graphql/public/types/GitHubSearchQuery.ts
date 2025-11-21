import type {GitHubSearchQueryResolvers} from '../resolverTypes'

const GitHubSearchQuery: GitHubSearchQueryResolvers = {
  lastUsedAt: async ({lastUsedAt}) => {
    return new Date(lastUsedAt)
  }
}

export default GitHubSearchQuery
