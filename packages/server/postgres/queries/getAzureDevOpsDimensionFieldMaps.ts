import getPg from '../getPg'
import {
  getAzureDevOpsDimensionFieldMapsQuery,
  IGetAzureDevOpsDimensionFieldMapsQueryResult
} from './generated/getAzureDevOpsDimensionFieldMapsQuery'

export interface AzureDevOpsDimensionFieldMap extends IGetAzureDevOpsDimensionFieldMapsQueryResult {}

const getAzureDevOpsDimensionFieldMaps = async (
  teamId: string,
  dimensionName: string,
  instanceId: string,
  projectKey: string
) => {
  console.log(`calling getAzureDevOpsDimensionFieldMaps with teamId: ${teamId} | dimensionName:${dimensionName} | instanceId:${instanceId} | projectKey:${projectKey}`)
  // pg-typed doesnt' support records, so we can't use multiple composite keys
  // https://github.com/adelsz/pgtyped/issues/317
  const res = await getAzureDevOpsDimensionFieldMapsQuery.run(
    {teamId, dimensionName, instanceId, projectKey} as any,
    getPg()
  )
  console.log(`returned from getAzureDevOpsDimensionFieldMapsQuery.run - ${res.length} `)
  const fieldMapEntry = res[0] as AzureDevOpsDimensionFieldMap
  console.log(`fieldMapEntry:${fieldMapEntry}`)
  return fieldMapEntry
}
export default getAzureDevOpsDimensionFieldMaps
