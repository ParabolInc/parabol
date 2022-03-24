import {_XGitHubRepositoryResolvers} from '../resolverTypes'

const _xGitHubRepository: _XGitHubRepositoryResolvers = {
  __isTypeOf: ({nameWithOwner}) => !!nameWithOwner,
  service: () => 'github'
}

export default _xGitHubRepository
