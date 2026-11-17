import type {DimensionFieldCtx, DimensionFieldKey} from '../platform/ServerIntegrationDefinition'
import {loadClickUpEstimateFields} from './clickUpEstimateFields'
import {CLICKUP_SPRINT_POINTS_FIELD} from './listClickUpDimensionFields'

const resolveClickUpDimensionFieldKey = async (
  ctx: DimensionFieldCtx
): Promise<DimensionFieldKey | null> => {
  const estimateFields = await loadClickUpEstimateFields(ctx)
  if (!estimateFields) return null
  const {clickUpTask, sprintPoints, customFields} = estimateFields
  const {listId, customItemId} = clickUpTask
  const customFieldIds = customFields.map(({fieldId}) => fieldId)
  return {
    repoId: listId,
    issueType: customItemId ? String(customItemId) : null,
    usableFieldIds:
      sprintPoints === 'disabled'
        ? customFieldIds
        : [CLICKUP_SPRINT_POINTS_FIELD, ...customFieldIds]
  }
}

export default resolveClickUpDimensionFieldKey
