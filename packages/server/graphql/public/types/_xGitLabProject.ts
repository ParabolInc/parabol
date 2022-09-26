import {_XGitLabProjectResolvers} from '../resolverTypes'

const _xGitLabProject: _XGitLabProjectResolvers = {
  __isTypeOf: ({id, service}) => id?.startsWith('gid://') || service === 'gitlab',
  service: () => 'gitlab'
}

export default _xGitLabProject
