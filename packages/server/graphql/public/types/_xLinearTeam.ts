import type {_XLinearTeamResolvers} from '../resolverTypes'

const _xLinearTeam: _XLinearTeamResolvers = {
  service: () => 'linear',
  name: ({displayName, name}) => displayName ?? name
}

export default _xLinearTeam
