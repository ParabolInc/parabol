import type {
  DimensionFieldCtx,
  DimensionFieldKey,
  DimensionFieldTarget
} from '../platform/ServerIntegrationDefinition'
import listAzureDevOpsDimensionFields from './listAzureDevOpsDimensionFields'

const describeAzureDevOpsDimensionField = async (
  ctx: DimensionFieldCtx,
  _key: DimensionFieldKey,
  fieldId: string
): Promise<DimensionFieldTarget | Error> => {
  const {options} = await listAzureDevOpsDimensionFields(ctx)
  const field = options.find((option) => option.fieldId === fieldId)
  if (!field) return new Error('That field is not on this work item type')
  return {fieldId, fieldName: field.label, fieldType: field.type}
}

export default describeAzureDevOpsDimensionField
