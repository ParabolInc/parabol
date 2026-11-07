import type {DimensionFieldCtx, DimensionFieldKey} from '../platform/ServerIntegrationDefinition'
import {loadClickUpEstimateFields} from './listClickUpDimensionFields'

const resolveClickUpDimensionFieldKey = async (
  ctx: DimensionFieldCtx
): Promise<DimensionFieldKey | null> => {
  const estimateFields = await loadClickUpEstimateFields(ctx)
  if (!estimateFields) return null
  const {clickUpTask, options} = estimateFields
  const {listId, customItemId} = clickUpTask
  return {
    repoId: listId,
    issueType: customItemId ? String(customItemId) : null,
    usableFieldIds: options.map(({fieldId}) => fieldId)
  }
}

export default resolveClickUpDimensionFieldKey
