import {NotificationTeamInvitationResolvers} from '../resolverTypes'

const NotificationTeamInvitation: NotificationTeamInvitationResolvers = {
  __isTypeOf: ({type}) => type === 'TEAM_INVITATION',
  invitation: async ({invitationId}, _args, {dataLoader}) => {
    return dataLoader.get('teamInvitations').load(invitationId)
  },
  team: async ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default NotificationTeamInvitation
