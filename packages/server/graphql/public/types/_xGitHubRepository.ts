import type {_XGitHubRepositoryResolvers} from '../resolverTypes'

const _xGitHubRepository: _XGitHubRepositoryResolvers = {
  __isTypeOf: ({nameWithOwner}) => !!nameWithOwner,
  service: () => 'github',
  name: ({nameWithOwner}) => nameWithOwner
}

export default _xGitHubRepository
