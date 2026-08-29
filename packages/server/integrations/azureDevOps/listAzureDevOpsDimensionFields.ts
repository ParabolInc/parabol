import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import {fieldTypeToId} from '../../utils/azureDevOps/azureDevOpsFieldTypeToId'
import type {
  DimensionFieldCtx,
  DimensionFieldListing,
  DimensionFieldOption
} from '../platform/ServerIntegrationDefinition'

const OPTION_BY_FIELD_PATH: Record<string, DimensionFieldOption> = {
  '/fields/Microsoft.VSTS.Scheduling.StoryPoints': {
    fieldId: SprintPokerDefaults.AZURE_DEVOPS_USERSTORY_FIELD,
    label: SprintPokerDefaults.AZURE_DEVOPS_USERSTORY_FIELD_LABEL
  },
  '/fields/Microsoft.VSTS.Scheduling.OriginalEstimate': {
    fieldId: SprintPokerDefaults.AZURE_DEVOPS_TASK_FIELD,
    label: SprintPokerDefaults.AZURE_DEVOPS_TASK_FIELD_LABEL
  },
  '/fields/Microsoft.VSTS.Scheduling.RemainingWork': {
    fieldId: SprintPokerDefaults.AZURE_DEVOPS_REMAINING_WORK_FIELD,
    label: SprintPokerDefaults.AZURE_DEVOPS_REMAINING_WORK_LABEL
  },
  '/fields/Microsoft.VSTS.Scheduling.Effort': {
    fieldId: SprintPokerDefaults.AZURE_DEVOPS_EFFORT_FIELD,
    label: SprintPokerDefaults.AZURE_DEVOPS_EFFORT_LABEL
  },
  '/fields/Microsoft.VSTS.Scheduling.Size': {
    fieldId: SprintPokerDefaults.AZURE_DEVOPS_SIZE_FIELD,
    label: SprintPokerDefaults.AZURE_DEVOPS_SIZE_LABEL
  }
}

const isKnownWorkItemType = (type: string): type is keyof typeof fieldTypeToId =>
  Object.hasOwn(fieldTypeToId, type)

const listAzureDevOpsDimensionFields = async ({
  task,
  dataLoader,
  teamId
}: DimensionFieldCtx): Promise<DimensionFieldListing> => {
  const {integration} = task
  if (integration?.service !== 'azureDevOps') return {options: []}
  const {accessUserId, instanceId, issueKey, projectKey} = integration
  const workItem = await dataLoader.get('azureDevOpsWorkItem').load({
    teamId,
    userId: accessUserId,
    instanceId,
    projectId: projectKey,
    viewerId: accessUserId,
    workItemId: issueKey
  })
  if (!workItem || !isKnownWorkItemType(workItem.type)) return {options: []}
  const option = OPTION_BY_FIELD_PATH[fieldTypeToId[workItem.type]]
  return {options: option ? [option] : []}
}

export default listAzureDevOpsDimensionFields
