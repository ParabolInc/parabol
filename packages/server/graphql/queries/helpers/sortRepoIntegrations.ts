import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import {RemoteRepoIntegration} from './fetchAllRepoIntegrations'

const sortRepoIntegrations = async (
  allRepoIntegrations: RemoteRepoIntegration[] | null,
  prevUsedRepoIntegrations: RemoteRepoIntegration[] | null
) => {
  if (!prevUsedRepoIntegrations) return allRepoIntegrations ?? []
  if (!allRepoIntegrations) return prevUsedRepoIntegrations
  const prevUsedRepoIntegrationIds = prevUsedRepoIntegrations.map((repoIntegration) => {
    return IntegrationRepoId.join(repoIntegration)
  })
  const unusedRepoIntegrations = allRepoIntegrations.filter((repoIntegration) => {
    const repoIntegrationId = IntegrationRepoId.join(repoIntegration)
    return !prevUsedRepoIntegrationIds.includes(repoIntegrationId)
  })
  return [...prevUsedRepoIntegrations, ...unusedRepoIntegrations]
}

export default sortRepoIntegrations
