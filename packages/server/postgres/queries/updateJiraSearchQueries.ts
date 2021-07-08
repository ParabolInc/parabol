import getPg from '../getPg'
import {
  IUpdateJiraSearchQueriesQueryParams,
  updateJiraSearchQueriesQuery
} from './generated/updateJiraSearchQueriesQuery'

interface UpdateJiraSearchQueryParams
  extends Omit<IUpdateJiraSearchQueriesQueryParams, 'jiraSearchQueries'> {
  jiraSearchQueries: {
    queryString: string
    projectKeyFilters?: string[]
    lastUsedAt?: string
    isJQL: boolean
  }[]
}

const updateJiraSearchQueries = async (params: UpdateJiraSearchQueryParams) => {
  await updateJiraSearchQueriesQuery.run(params as IUpdateJiraSearchQueriesQueryParams, getPg())
}
export default updateJiraSearchQueries
