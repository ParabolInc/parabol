import {NotifyTeamArchivedResolvers} from '../resolverTypes'

const NotifyTeamArchived: NotifyTeamArchivedResolvers = {
  __isTypeOf: ({type}) => type === 'TEAM_ARCHIVED',
  archivor: ({archivorUserId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(archivorUserId)
  },

  team: async ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default NotifyTeamArchived
