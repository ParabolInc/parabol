import {MaybeReadonly} from 'parabol-client/types/generics'
import getPg from '../getPg'
import {
  getGitHubDimensionFieldMapsQuery,
  IGetGitHubDimensionFieldMapsQueryResult
} from './generated/getGitHubDimensionFieldMapsQuery'

export interface GitHubDimensionFieldMap extends IGetGitHubDimensionFieldMapsQueryResult {}

interface Key {
  teamId: string
  dimensionName: string
  nameWithOwner: string
}

const getGitHubDimensionFieldMaps = async (keys: MaybeReadonly<Key[]>) => {
  const res = await getGitHubDimensionFieldMapsQuery.run(keys as any, getPg())
  return res as GitHubDimensionFieldMap[]
}
export default getGitHubDimensionFieldMaps
