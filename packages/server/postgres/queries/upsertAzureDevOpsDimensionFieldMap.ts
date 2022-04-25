import getPg from '../getPg'
import {upsertAzureDevOpsDimensionFieldMapQuery} from './generated/upsertAzureDevOpsDimensionFieldMapQuery'

const upsertAzureDevOpsDimensionFieldMap = async (
  teamId: string,
  dimensionName: string,
  fieldName: string,
  fieldId: string,
  instanceId: string,
  fieldType: string,
  projectKey: string
) => {
  return upsertAzureDevOpsDimensionFieldMapQuery.run(
    {fieldMap: {teamId, dimensionName, fieldName, fieldId, instanceId, fieldType, projectKey}},
    getPg()
  )
}
export default upsertAzureDevOpsDimensionFieldMap
