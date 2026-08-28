import type {DimensionFieldCtx, DimensionFieldKey} from '../platform/ServerIntegrationDefinition'

const resolveGitHubDimensionFieldKey = async ({
  task
}: DimensionFieldCtx): Promise<DimensionFieldKey | null> => {
  const {integration} = task
  if (integration?.service !== 'github') return null
  return {repoId: integration.nameWithOwner, workItemType: ''}
}

export default resolveGitHubDimensionFieldKey
