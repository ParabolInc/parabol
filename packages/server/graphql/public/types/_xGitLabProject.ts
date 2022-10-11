import {_XGitLabProjectResolvers} from '../resolverTypes'

const _xGitLabProject: _XGitLabProjectResolvers = {
  __isTypeOf: ({id}) => id.startsWith('gid://'),
  service: () => 'gitlab'
}

export default _xGitLabProject
