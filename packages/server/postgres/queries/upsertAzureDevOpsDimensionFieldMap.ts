import getPg from '../getPg'
import {upsertAzureDevOpsDimensionFieldMapQuery} from './generated/upsertAzureDevOpsDimensionFieldMapQuery'

export interface AzureDevOpsFieldMapProps {
  teamId: string
  dimensionName: string
  fieldName: string
  fieldId: string
  instanceId: string
  fieldType: string
  projectKey: string
}
const upsertAzureDevOpsDimensionFieldMap = async (props: AzureDevOpsFieldMapProps) => {
  const {teamId, dimensionName, fieldName, fieldId, instanceId, fieldType, projectKey} = props
  return upsertAzureDevOpsDimensionFieldMapQuery.run(
    {fieldMap: {teamId, dimensionName, fieldName, fieldId, instanceId, fieldType, projectKey}},
    getPg()
  )
}
export default upsertAzureDevOpsDimensionFieldMap
