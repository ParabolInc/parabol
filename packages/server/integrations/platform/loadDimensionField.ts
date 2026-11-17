import pickDimensionField from './pickDimensionField'
import type {DimensionFieldCtx, DimensionFieldKey} from './ServerIntegrationDefinition'

const loadDimensionField = async (
  resolveKey: (ctx: DimensionFieldCtx) => Promise<DimensionFieldKey | null>,
  ctx: DimensionFieldCtx,
  dimensionName: string
) => {
  const {task, dataLoader, teamId} = ctx
  const {integration} = task
  if (!integration) return null
  const key = await resolveKey(ctx)
  if (!key) return null
  const rows = await dataLoader
    .get('integrationDimensionFieldMaps')
    .load({teamId, service: integration.service, repoId: key.repoId, dimensionName})
  return {key, field: pickDimensionField(rows, key)}
}

export default loadDimensionField
