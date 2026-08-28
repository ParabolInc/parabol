import type {
  DimensionFieldCtx,
  DimensionFieldKey,
  DimensionFieldTarget
} from '../platform/ServerIntegrationDefinition'

const describeAzureDevOpsDimensionField = async (
  _ctx: DimensionFieldCtx,
  _key: DimensionFieldKey,
  fieldName: string
): Promise<DimensionFieldTarget | Error> => {
  if (fieldName.trim().length === 0 || fieldName.length > 120) {
    return new Error('Field name must be 1–120 characters')
  }
  return {fieldId: fieldName, fieldName, fieldType: 'string'}
}

export default describeAzureDevOpsDimensionField
