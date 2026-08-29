import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import type {_XGitLabProjectResolvers} from '../resolverTypes'

// There's a bug in GraphQL Codegen that allow mappers to start with `_`
// So, we overwrite the GitLab native object with this type, too
export type _xGitLabProjectSource = {
  __typename: 'Project'
  service: 'gitlab'
  id: string
  fullPath?: string
  name?: string
}

const _xGitLabProject: _XGitLabProjectResolvers = {
  __isTypeOf: ({id}) => id.startsWith('gid://'),
  service: () => 'gitlab',
  name: ({fullPath, name}) => {
    const label = fullPath ?? name
    if (!label) throw new Error('GitLab project has neither a fullPath nor a name')
    return label
  },
  integrationRepoId: ({fullPath}) => {
    if (!fullPath) throw new Error('GitLab project has no fullPath')
    return IntegrationRepoId.join({service: 'gitlab', fullPath})
  }
}

export default _xGitLabProject
