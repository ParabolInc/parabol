import type {_XLinearTeamResolvers} from '../resolverTypes'

const _xLinearTeam: _XLinearTeamResolvers = {
  service: () => 'linear',
  name: ({displayName}) => displayName
}

export default _xLinearTeam
