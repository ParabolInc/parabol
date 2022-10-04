import {GraphQLID, GraphQLNonNull} from 'graphql'
import {InvitationTokenError} from 'parabol-client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {verifyMassInviteToken} from '../../utils/massInviteToken'
import {GQLContext} from '../graphql'
import rateLimit from '../rateLimit'
import MassInvitationPayload from '../types/MassInvitationPayload'

export default {
  type: new GraphQLNonNull(MassInvitationPayload),
  args: {
    token: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The mass invitation token'
    }
  },
  resolve: rateLimit({perMinute: 60, perHour: 1800})(
    async (_source: unknown, {token}, {dataLoader}: GQLContext) => {
      const tokenRes = await verifyMassInviteToken(token, dataLoader)
      if ('error' in tokenRes && tokenRes.error === InvitationTokenError.NOT_FOUND) {
        return {errorType: InvitationTokenError.NOT_FOUND}
      }
      const {error, teamId, userId} = tokenRes as any
      const teamMemberId = toTeamMemberId(teamId, userId)
      const [teamMember, team] = await Promise.all([
        dataLoader.get('teamMembers').load(teamMemberId),
        dataLoader.get('teams').load(teamId)
      ])

      if (!teamMember || !teamMember.isNotRemoved || !team || team.isArchived) {
        // this could happen if a team member is no longer on the team or some unseen nefarious action is going on
        return {errorType: InvitationTokenError.NOT_FOUND}
      }
      return {
        errorType: error,
        inviterName: teamMember.preferredName,
        teamId,
        teamName: team.name
      }
    }
  )
}
