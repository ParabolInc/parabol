import {getServerIntegration} from './registry'
import type {
  DimensionFieldCtx,
  EstimatePushTarget,
  ServiceField
} from './ServerIntegrationDefinition'

export interface ResolvedServiceFieldListing {
  targets: EstimatePushTarget[]
  options: ServiceField[]
  helpUrl: string | null
}

const EMPTY_LISTING: ResolvedServiceFieldListing = {targets: [], options: [], helpUrl: null}

const listDimensionFields = async (
  ctx: DimensionFieldCtx
): Promise<ResolvedServiceFieldListing> => {
  const {integration} = ctx.task
  if (!integration) return EMPTY_LISTING
  const {estimatePush} = getServerIntegration(integration.service).capabilities
  const {options, helpUrl} = await estimatePush.listDimensionFields(ctx)
  return {targets: estimatePush.targets, options, helpUrl: helpUrl ?? null}
}

export default listDimensionFields
