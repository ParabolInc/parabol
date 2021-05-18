import getPg from '../getPg'
import {
  IUpdateGitHubSearchQueriesQueryParams,
  updateGitHubSearchQueriesQuery
} from './generated/updateGitHubSearchQueriesQuery'

const updateGitHubSearchQueries = async (params: IUpdateGitHubSearchQueriesQueryParams) => {
  await updateGitHubSearchQueriesQuery.run(params, getPg())
}
export default updateGitHubSearchQueries
