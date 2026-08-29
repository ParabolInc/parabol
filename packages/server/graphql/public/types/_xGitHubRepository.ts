import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import type {_XGitHubRepositoryResolvers} from '../resolverTypes'

const _xGitHubRepository: _XGitHubRepositoryResolvers = {
  __isTypeOf: ({nameWithOwner}) => !!nameWithOwner,
  service: () => 'github',
  name: ({nameWithOwner, name}) => nameWithOwner ?? name,
  integrationRepoId: ({nameWithOwner}) => {
    if (!nameWithOwner) throw new Error('GitHub repository has no nameWithOwner')
    return IntegrationRepoId.join({service: 'github', nameWithOwner})
  }
}

export default _xGitHubRepository
