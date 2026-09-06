import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import type {ServiceField} from '../platform/ServerIntegrationDefinition'

const azureDevOpsDimensionFieldOptions: Record<string, ServiceField> = {
  '/fields/Microsoft.VSTS.Scheduling.StoryPoints': {
    fieldId: SprintPokerDefaults.AZURE_DEVOPS_USERSTORY_FIELD,
    label: SprintPokerDefaults.AZURE_DEVOPS_USERSTORY_FIELD_LABEL,
    type: 'string'
  },
  '/fields/Microsoft.VSTS.Scheduling.OriginalEstimate': {
    fieldId: SprintPokerDefaults.AZURE_DEVOPS_TASK_FIELD,
    label: SprintPokerDefaults.AZURE_DEVOPS_TASK_FIELD_LABEL,
    type: 'string'
  },
  '/fields/Microsoft.VSTS.Scheduling.RemainingWork': {
    fieldId: SprintPokerDefaults.AZURE_DEVOPS_REMAINING_WORK_FIELD,
    label: SprintPokerDefaults.AZURE_DEVOPS_REMAINING_WORK_LABEL,
    type: 'string'
  },
  '/fields/Microsoft.VSTS.Scheduling.Effort': {
    fieldId: SprintPokerDefaults.AZURE_DEVOPS_EFFORT_FIELD,
    label: SprintPokerDefaults.AZURE_DEVOPS_EFFORT_LABEL,
    type: 'string'
  },
  '/fields/Microsoft.VSTS.Scheduling.Size': {
    fieldId: SprintPokerDefaults.AZURE_DEVOPS_SIZE_FIELD,
    label: SprintPokerDefaults.AZURE_DEVOPS_SIZE_LABEL,
    type: 'string'
  }
}

export const getAzureDevOpsDimensionFieldLabel = (fieldId: string) =>
  Object.values(azureDevOpsDimensionFieldOptions).find((option) => option.fieldId === fieldId)
    ?.label ?? null

export default azureDevOpsDimensionFieldOptions
