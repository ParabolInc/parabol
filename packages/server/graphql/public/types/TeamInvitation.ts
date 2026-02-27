import type {TeamInvitationResolvers} from '../resolverTypes'

const TeamInvitation: TeamInvitationResolvers = {
  inviter: ({invitedBy}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(invitedBy)
  }
}

export default TeamInvitation
