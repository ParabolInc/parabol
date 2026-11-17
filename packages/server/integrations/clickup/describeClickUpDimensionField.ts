import type {
  DimensionFieldCtx,
  DimensionFieldKey,
  DimensionFieldTarget
} from '../platform/ServerIntegrationDefinition'
import listClickUpDimensionFields from './listClickUpDimensionFields'

const describeClickUpDimensionField = async (
  ctx: DimensionFieldCtx,
  _key: DimensionFieldKey,
  fieldId: string
): Promise<DimensionFieldTarget | Error> => {
  const {options} = await listClickUpDimensionFields(ctx)
  const field = options.find((option) => option.fieldId === fieldId)
  if (!field) return new Error('That field is not on this ClickUp task')
  return {fieldId, fieldName: field.label, fieldType: field.type}
}

export default describeClickUpDimensionField
