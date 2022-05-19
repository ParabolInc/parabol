import getPg from '../getPg'
import {
  getAzureDevOpsDimensionFieldMapsQuery,
  IGetAzureDevOpsDimensionFieldMapsQueryResult
} from './generated/getAzureDevOpsDimensionFieldMapsQuery'

export interface AzureDevOpsDimensionFieldMap
  extends IGetAzureDevOpsDimensionFieldMapsQueryResult {}

const getAzureDevOpsDimensionFieldMaps = async (
  teamId: string,
  dimensionName: string,
  instanceId: string,
  projectKey: string
) => {
  // pg-typed doesnt' support records, so we can't use multiple composite keys
  // https://github.com/adelsz/pgtyped/issues/317
  const res = await getAzureDevOpsDimensionFieldMapsQuery.run(
    {teamId, dimensionName, instanceId, projectKey},
    getPg()
  )
  return res[0] as AzureDevOpsDimensionFieldMap
}
export default getAzureDevOpsDimensionFieldMaps
