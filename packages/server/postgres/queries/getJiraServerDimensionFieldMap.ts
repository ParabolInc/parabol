import getPg from '../getPg'
import {
  getJiraServerDimensionFieldMapQuery,
  IGetJiraServerDimensionFieldMapQueryResult
} from './generated/getJiraServerDimensionFieldMapQuery'

export interface JiraServerDimensionFieldMap extends IGetJiraServerDimensionFieldMapQueryResult {}

const getJiraServerDimensionFieldMap = async (
  providerId: number,
  teamId: string,
  projectId: string,
  dimensionName: string
) => {
  // pg-typed doesnt' support records, so we can't use multiple composite keys
  // https://github.com/adelsz/pgtyped/issues/317
  const res = await getJiraServerDimensionFieldMapQuery.run(
    {providerId, teamId, projectId, dimensionName} as any,
    getPg()
  )
  return res[0] as JiraServerDimensionFieldMap
}
export default getJiraServerDimensionFieldMap
