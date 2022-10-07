import IntegrationRepoId, {
  RepoIntegration as RepoIntegrationType
} from 'parabol-client/shared/gqlIds/IntegrationRepoId'

const sortRepoIntegrations = async (
  allRepoIntegrations: RepoIntegrationType[] | null,
  prevUsedRepoIntegrations: RepoIntegrationType[] | null
) => {
  if (!prevUsedRepoIntegrations) return allRepoIntegrations ?? []
  if (!allRepoIntegrations) return prevUsedRepoIntegrations
  const prevUsedRepoIntegrationIds = prevUsedRepoIntegrations.map((repoIntegration) =>
    IntegrationRepoId.join(repoIntegration)
  )
  const unusedRepoIntegrations = allRepoIntegrations.filter((repoIntegration) => {
    const repoIntegrationId = IntegrationRepoId.join(repoIntegration)
    return !prevUsedRepoIntegrationIds.includes(repoIntegrationId)
  })
  return [...prevUsedRepoIntegrations, ...unusedRepoIntegrations]
}

export default sortRepoIntegrations
