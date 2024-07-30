import {_XGitLabProjectResolvers} from '../resolverTypes'

// There's a bug in GraphQL Codegen that allow mappers to start with `_`
// So, we overwrite the GitLab native object with this type, too
export type _xGitLabProjectSource = {
  __typename: 'Project'
  service: 'gitlab'
  id: string
  fullPath: string
}

const _xGitLabProject: _XGitLabProjectResolvers = {
  __isTypeOf: ({id}) => id.startsWith('gid://'),
  service: () => 'gitlab'
}

export default _xGitLabProject
