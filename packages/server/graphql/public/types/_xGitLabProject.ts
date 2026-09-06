import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import type {_XGitLabProjectResolvers} from '../resolverTypes'

const _xGitLabProject: _XGitLabProjectResolvers = {
  __isTypeOf: ({id}) => id.startsWith('gid://'),
  service: () => 'gitlab',
  name: ({fullPath}) => fullPath,
  integrationRepoId: ({fullPath}) => IntegrationRepoId.join({service: 'gitlab', fullPath})
}

export default _xGitLabProject
