import type {
  DimensionFieldCtx,
  DimensionFieldKey,
  DimensionFieldTarget
} from '../platform/ServerIntegrationDefinition'

const describeAzureDevOpsDimensionField = async (
  _ctx: DimensionFieldCtx,
  _key: DimensionFieldKey,
  fieldId: string
): Promise<DimensionFieldTarget | Error> => {
  if (fieldId.trim().length === 0 || fieldId.length > 120) {
    return new Error('Field name must be 1–120 characters')
  }
  return {fieldId, fieldName: null, fieldType: 'string'}
}

export default describeAzureDevOpsDimensionField
