import getPg from '../getPg'
import {
  IUpdateGitHubSearchQueriesQueryParams,
  updateGitHubSearchQueriesQuery
} from './generated/updateGitHubSearchQueriesQuery'

interface UpdateParams extends Omit<IUpdateGitHubSearchQueriesQueryParams, 'githubSearchQueries'> {
  githubSearchQueries: {lastUsedAt: Date; queryString: string}[]
}

const updateGitHubSearchQueries = async (params: UpdateParams) => {
  await updateGitHubSearchQueriesQuery.run(params as any, getPg())
}
export default updateGitHubSearchQueries
