import getPg from '../getPg'
import {
  getGitLabDimensionFieldMapsQuery,
  IGetGitLabDimensionFieldMapsQueryResult
} from './generated/getGitLabDimensionFieldMapsQuery'

export interface GitLabDimensionFieldMap extends IGetGitLabDimensionFieldMapsQueryResult {}

const getGitLabDimensionFieldMaps = async (
  teamId: string,
  dimensionName: string,
  projectId: number,
  providerId: number
) => {
  // pg-typed doesnt' support records, so we can't use multiple composite keys
  // https://github.com/adelsz/pgtyped/issues/317
  const res = await getGitLabDimensionFieldMapsQuery.run(
    {teamId, dimensionName, projectId, providerId} as any,
    getPg()
  )
  return res[0] as GitLabDimensionFieldMap
}
export default getGitLabDimensionFieldMaps
