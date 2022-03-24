import {_XGitHubRepositoryResolvers} from '../resolverTypes'

const _xGitHubRepository: _XGitHubRepositoryResolvers = {
  __isTypeOf: ({nameWithOwner}: {nameWithOwner?: string}) => !!nameWithOwner,
  service: () => 'github'
}

export default _xGitHubRepository
