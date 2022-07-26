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
  workItemType: string
}
const upsertAzureDevOpsDimensionFieldMap = async (props: AzureDevOpsFieldMapProps) => {
  const {
    teamId,
    dimensionName,
    fieldName,
    fieldId,
    instanceId,
    fieldType,
    projectKey,
    workItemType
  } = props
  console.log(`Inside upsertAzureDevOpsDimensionFieldMap - props:${JSON.stringify(props)}`)
  return upsertAzureDevOpsDimensionFieldMapQuery.run(
    {
      fieldMap: {
        teamId,
        dimensionName,
        fieldName,
        fieldId,
        instanceId,
        fieldType,
        projectKey,
        workItemType
      }
    },
    getPg()
  )
}
export default upsertAzureDevOpsDimensionFieldMap
