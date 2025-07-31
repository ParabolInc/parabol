import getPg from '../getPg'
import {
  type IUpdateGitHubSearchQueriesQueryParams,
  updateGitHubSearchQueriesQuery
} from './generated/updateGitHubSearchQueriesQuery'
import type {GitHubSearchQuery} from './getGitHubAuthByUserIdTeamId'

interface UpdateParams extends Omit<IUpdateGitHubSearchQueriesQueryParams, 'githubSearchQueries'> {
  githubSearchQueries: GitHubSearchQuery[]
}

const updateGitHubSearchQueries = async (params: UpdateParams) => {
  return updateGitHubSearchQueriesQuery.run(params as any, getPg())
}
export default updateGitHubSearchQueries
