import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import type {_XGitHubRepositoryResolvers} from '../resolverTypes'

const _xGitHubRepository: _XGitHubRepositoryResolvers = {
  __isTypeOf: ({nameWithOwner}) => !!nameWithOwner,
  service: () => 'github',
  name: ({nameWithOwner}) => nameWithOwner,
  integrationRepoId: ({nameWithOwner}) => IntegrationRepoId.join({service: 'github', nameWithOwner})
}

export default _xGitHubRepository
