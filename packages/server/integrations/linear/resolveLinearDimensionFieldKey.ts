import type {DimensionFieldCtx, DimensionFieldKey} from '../platform/ServerIntegrationDefinition'

const resolveLinearDimensionFieldKey = async ({
  task
}: DimensionFieldCtx): Promise<DimensionFieldKey | null> => {
  const {integration} = task
  if (integration?.service !== 'linear') return null
  return {repoId: integration.repoId, issueType: null}
}

export default resolveLinearDimensionFieldKey
