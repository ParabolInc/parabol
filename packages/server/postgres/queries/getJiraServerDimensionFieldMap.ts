import getPg from '../getPg'
import {
  getJiraServerDimensionFieldMapQuery,
  IGetJiraServerDimensionFieldMapQueryParams,
  IGetJiraServerDimensionFieldMapQueryResult
} from './generated/getJiraServerDimensionFieldMapQuery'

export interface JiraServerDimensionFieldMap extends IGetJiraServerDimensionFieldMapQueryResult {}
export interface GetJiraServerDimensionFieldMapParams extends IGetJiraServerDimensionFieldMapQueryParams {}

const getJiraServerDimensionFieldMap = async (params: GetJiraServerDimensionFieldMapParams) => {
  // pg-typed doesnt' support records, so we can't use multiple composite keys
  // https://github.com/adelsz/pgtyped/issues/317
  const res = await getJiraServerDimensionFieldMapQuery.run(
    params as any,
    getPg()
  )
  return res[0] as JiraServerDimensionFieldMap
}
export default getJiraServerDimensionFieldMap
