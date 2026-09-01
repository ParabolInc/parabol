import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import interleave from 'parabol-client/utils/interleave'
import type {RemoteRepoIntegration} from './RemoteRepoIntegration'

/** Previously used repos first, then a round-robin across services, without cross-service id collisions */
const mergeRepoIntegrations = (
  prevUsed: RemoteRepoIntegration[],
  lists: RemoteRepoIntegration[][]
) => {
  const seen = new Set<string>()
  return [...prevUsed, ...interleave(lists)].filter((repo) => {
    const key = `${repo.service}:${IntegrationRepoId.join(repo)}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export default mergeRepoIntegrations
