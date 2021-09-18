import getPg from '../getPg'
import {
  getGitHubDimensionFieldMapsQuery,
  IGetGitHubDimensionFieldMapsQueryResult
} from './generated/getGitHubDimensionFieldMapsQuery'

export interface GitHubDimensionFieldMap extends IGetGitHubDimensionFieldMapsQueryResult {}

const getGitHubDimensionFieldMaps = async (
  teamId: string,
  dimensionName: string,
  nameWithOwner: string
) => {
  // pg-typed doesnt' support records, so we can't use multiple composite keys
  // https://github.com/adelsz/pgtyped/issues/317
  const res = await getGitHubDimensionFieldMapsQuery.run(
    {teamId, dimensionName, nameWithOwner} as any,
    getPg()
  )
  return res[0] as GitHubDimensionFieldMap
}
export default getGitHubDimensionFieldMaps
