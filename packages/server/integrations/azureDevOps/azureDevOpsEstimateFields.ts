import type {ServiceField} from '../platform/ServerIntegrationDefinition'
import type {AzureDevOpsField} from './AzureDevOpsServerManager'

/** What the dimension field map stored before fields were listed from the work item type itself */
const LEGACY_FIELD_IDS: Record<string, string> = {
  __storyPoints: 'Microsoft.VSTS.Scheduling.StoryPoints',
  __origEst: 'Microsoft.VSTS.Scheduling.OriginalEstimate',
  __remainingWork: 'Microsoft.VSTS.Scheduling.RemainingWork',
  __effort: 'Microsoft.VSTS.Scheduling.Effort',
  __size: 'Microsoft.VSTS.Scheduling.Size'
}

const PREFERRED_FIELDS = Object.values(LEGACY_FIELD_IDS)
const NUMERIC_TYPES = ['double', 'integer']

export const toAzureDevOpsFieldReferenceName = (fieldId: string) =>
  Object.hasOwn(LEGACY_FIELD_IDS, fieldId) ? LEGACY_FIELD_IDS[fieldId]! : fieldId

const isEstimateField = ({referenceName, type, readOnly}: AzureDevOpsField) => {
  if (readOnly || referenceName.startsWith('System.')) return false
  if (NUMERIC_TYPES.includes(type)) return true
  return type === 'string' && referenceName.startsWith('Custom.')
}

const preference = ({fieldId}: ServiceField) => {
  const rank = PREFERRED_FIELDS.indexOf(fieldId)
  return rank === -1 ? PREFERRED_FIELDS.length : rank
}

/** The fields on a work item type that can hold an estimate: its numeric fields, plus custom text fields for T-shirt sizes */
export const listAzureDevOpsEstimateFields = (
  projectFields: AzureDevOpsField[],
  workItemTypeFieldNames: string[]
): ServiceField[] => {
  const onWorkItemType = new Set(workItemTypeFieldNames)
  return projectFields
    .filter((field) => onWorkItemType.has(field.referenceName) && isEstimateField(field))
    .map(({referenceName, name, type}) => ({
      fieldId: referenceName,
      label: name,
      type: type === 'string' ? 'string' : 'number'
    }))
    .sort((a, b) => preference(a) - preference(b) || a.label.localeCompare(b.label))
}
