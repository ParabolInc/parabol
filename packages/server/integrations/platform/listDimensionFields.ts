import {getServerIntegration} from './registry'
import type {
  DimensionFieldCtx,
  DimensionFieldOption,
  EstimatePushTarget
} from './ServerIntegrationDefinition'

export interface ResolvedDimensionFieldListing {
  targets: EstimatePushTarget[]
  options: DimensionFieldOption[]
  helpUrl: string | null
}

const EMPTY_LISTING: ResolvedDimensionFieldListing = {targets: [], options: [], helpUrl: null}

const listDimensionFields = async (
  ctx: DimensionFieldCtx
): Promise<ResolvedDimensionFieldListing> => {
  const {integration} = ctx.task
  if (!integration) return EMPTY_LISTING
  const {estimatePush} = getServerIntegration(integration.service).capabilities
  const {options, helpUrl} = await estimatePush.listDimensionFields(ctx)
  return {targets: estimatePush.targets, options, helpUrl: helpUrl ?? null}
}

export default listDimensionFields
