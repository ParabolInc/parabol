import type {NotifyTeamArchivedResolvers} from '../resolverTypes'

const NotifyTeamArchived: NotifyTeamArchivedResolvers = {
  __isTypeOf: ({type}) => type === 'TEAM_ARCHIVED',
  archivor: ({archivorUserId}, _args, {dataLoader}) => {
    return archivorUserId ? dataLoader.get('users').loadNonNull(archivorUserId) : null
  },

  team: async ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default NotifyTeamArchived
