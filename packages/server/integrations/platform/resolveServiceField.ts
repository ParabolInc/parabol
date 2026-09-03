import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import loadDimensionField from './loadDimensionField'
import {getServerIntegration} from './registry'
import type {DimensionFieldCtx, ServiceField} from './ServerIntegrationDefinition'

const resolveServiceField = async (
  ctx: DimensionFieldCtx & {dimensionName: string}
): Promise<ServiceField | null> => {
  const {integration} = ctx.task
  if (!integration) return null
  const {estimatePush} = getServerIntegration(integration.service).capabilities
  const dimensionFieldLookup = await loadDimensionField(
    estimatePush.resolveDimensionFieldKey,
    ctx,
    ctx.dimensionName
  )
  if (!dimensionFieldLookup) return null
  const {field} = dimensionFieldLookup
  if (field) return {name: field.fieldName ?? field.fieldId, type: field.fieldType}
  return {name: SprintPokerDefaults.SERVICE_FIELD_COMMENT, type: 'string'}
}

export default resolveServiceField
