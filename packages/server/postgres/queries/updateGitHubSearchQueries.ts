import getPg from '../getPg'
import {
  IUpdateGitHubSearchQueriesQueryParams,
  updateGitHubSearchQueriesQuery
} from './generated/updateGitHubSearchQueriesQuery'
import {GitHubSearchQuery} from './getGitHubAuthByUserIdTeamId'

interface UpdateParams extends Omit<IUpdateGitHubSearchQueriesQueryParams, 'githubSearchQueries'> {
  githubSearchQueries: GitHubSearchQuery[]
}

const updateGitHubSearchQueries = async (params: UpdateParams) => {
  return updateGitHubSearchQueriesQuery.run(params as any, getPg())
}
export default updateGitHubSearchQueries
