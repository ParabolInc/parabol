import type {_XGitHubRepositoryResolvers} from '../resolverTypes'

const _xGitHubRepository: _XGitHubRepositoryResolvers = {
  __isTypeOf: ({nameWithOwner}) => !!nameWithOwner,
  service: () => 'github',
  name: ({nameWithOwner, name}) => nameWithOwner ?? name
}

export default _xGitHubRepository
