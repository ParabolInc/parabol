import getPg from '../getPg'
import {
  IUpdateJiraSearchQueriesQueryParams,
  updateJiraSearchQueriesQuery
} from './generated/updateJiraSearchQueriesQuery'

const updateJiraSearchQueries = async (params: IUpdateJiraSearchQueriesQueryParams) => {
  await updateJiraSearchQueriesQuery.run(params, getPg())
}
export default updateJiraSearchQueries
