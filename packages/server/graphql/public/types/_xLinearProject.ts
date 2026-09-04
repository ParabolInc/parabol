import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import type {_XLinearProjectResolvers} from '../resolverTypes'

export type _xLinearProjectSource = {
  id: string
  name?: string
  teamId?: string
  teams?: {nodes?: {id: string; displayName?: string}[] | null} | null
}

const _xLinearProject: _XLinearProjectResolvers = {
  service: () => 'linear',
  integrationRepoId: ({id, teamId, teams}) => {
    const linearTeamId = teamId || teams?.nodes?.[0]?.id
    if (!linearTeamId) throw new Error('Linear project has no team')
    return IntegrationRepoId.join({service: 'linear', id, teamId: linearTeamId})
  }
}

export default _xLinearProject
