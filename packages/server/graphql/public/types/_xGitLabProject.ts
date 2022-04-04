import {_XGitLabProjectResolvers} from '../resolverTypes'

const _xGitLabProject: _XGitLabProjectResolvers = {
  __isTypeOf: ({__typename}) => __typename === '_xGitLabProject',
  service: () => 'gitlab'
}

export default _xGitLabProject
