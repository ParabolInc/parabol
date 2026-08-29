import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import type {_XLinearTeamResolvers} from '../resolverTypes'

const _xLinearTeam: _XLinearTeamResolvers = {
  service: () => 'linear',
  name: ({displayName, name}) => displayName ?? name,
  integrationRepoId: ({id}) => IntegrationRepoId.join({service: 'linear', id, teamId: id})
}

export default _xLinearTeam
