import {GraphQLID, GraphQLNonNull} from 'graphql'
import rateLimit from 'server/graphql/rateLimit'
import MassInvitationPayload from 'server/graphql/types/MassInvitationPayload'
import {verifyMassInviteToken} from 'server/utils/massInviteToken'
import {GQLContext} from 'server/graphql/graphql'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'

export default {
  type: MassInvitationPayload,
  args: {
    token: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The mass invitation token'
    }
  },
  resolve: rateLimit({perMinute: 10, perHour: 100})(
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
