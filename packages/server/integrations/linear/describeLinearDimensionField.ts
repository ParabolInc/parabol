import type {
  DimensionFieldCtx,
  DimensionFieldKey,
  DimensionFieldTarget
} from '../platform/ServerIntegrationDefinition'

const describeLinearDimensionField = async (
  _ctx: DimensionFieldCtx,
  _key: DimensionFieldKey,
  fieldId: string
): Promise<DimensionFieldTarget | Error> => {
  if (fieldId.trim().length === 0 || fieldId.length > 100) {
    return new Error('Label template must be 1–100 characters')
  }
  return {fieldId, fieldName: null, fieldType: 'string'}
}

export default describeLinearDimensionField
