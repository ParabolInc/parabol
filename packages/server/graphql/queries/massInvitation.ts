import {GraphQLID, GraphQLNonNull} from 'graphql'
import rateLimit from '../rateLimit'
import MassInvitationPayload from '../types/MassInvitationPayload'
import {verifyMassInviteToken} from '../../utils/massInviteToken'
import {GQLContext} from '../graphql'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'

export default {
  type: new GraphQLNonNull(MassInvitationPayload),
  args: {
    token: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The mass invitation token'
    }
  },
  resolve: rateLimit({perMinute: 60, perHour: 1800})(
    async (_source, {token}, {dataLoader}: GQLContext) => {
      const tokenRes = verifyMassInviteToken(token)
      if ('error' in tokenRes && tokenRes.error === 'notFound') {
        return {errorType: 'notFound'}
      }
      const {teamId, userId, error} = tokenRes
      const teamMemberId = toTeamMemberId(teamId, userId)
      const [teamMember, team] = await Promise.all([
        dataLoader.get('teamMembers').load(teamMemberId),
        dataLoader.get('teams').load(teamId)
      ])

      const meeting = team.meetingId
        ? await dataLoader.get('newMeetings').load(team.meetingId)
        : null
      const meetingType = (meeting && meeting.meetingType) || undefined
      if (!teamMember || !teamMember.isNotRemoved || !team || team.isArchived) {
        // this could happen if a team member is no longer on the team or some unseen nefarious action is going on
        return {errorType: 'notFound'}
      }
      return {
        errorType: error,
        inviterName: teamMember.preferredName,
        teamId,
        teamName: team.name,
        meetingType
      }
    }
  )
}
