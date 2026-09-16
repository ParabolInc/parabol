import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import loadDimensionField from './loadDimensionField'
import {getServerIntegration} from './registry'
import type {DimensionFieldCtx, ServiceField} from './ServerIntegrationDefinition'

export const NULL_SERVICE_FIELD: ServiceField = {
  fieldId: SprintPokerDefaults.SERVICE_FIELD_NULL,
  label: SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL,
  type: 'string'
}

export const COMMENT_SERVICE_FIELD: ServiceField = {
  fieldId: SprintPokerDefaults.SERVICE_FIELD_COMMENT,
  label: SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL,
  type: 'string'
}

const SENTINELS = [NULL_SERVICE_FIELD, COMMENT_SERVICE_FIELD]

const resolveServiceField = async (
  ctx: DimensionFieldCtx & {dimensionName: string}
): Promise<ServiceField> => {
  const {integration} = ctx.task
  if (!integration) return NULL_SERVICE_FIELD
  const {estimatePush} = getServerIntegration(integration.service).capabilities
  const lookup = await loadDimensionField(
    estimatePush.resolveDimensionFieldKey,
    ctx,
    ctx.dimensionName
  )
  if (!lookup) return NULL_SERVICE_FIELD
  const {field} = lookup
  if (!field) return COMMENT_SERVICE_FIELD
  const {fieldId, fieldName, fieldType} = field
  const sentinel = SENTINELS.find((candidate) => candidate.fieldId === fieldId)
  if (sentinel) return sentinel
  if (fieldName) return {fieldId, label: fieldName, type: fieldType}
  const {options} = await estimatePush.listDimensionFields(ctx)
  return (
    options.find((option) => option.fieldId === fieldId) ?? {
      fieldId,
      label: fieldId,
      type: fieldType
    }
  )
}

export default resolveServiceField
