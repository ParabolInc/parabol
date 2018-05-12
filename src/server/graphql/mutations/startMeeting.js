import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {startSlackMeeting} from 'server/graphql/mutations/helpers/notifySlack'
import StartMeetingPayload from 'server/graphql/types/StartMeetingPayload'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import shortid from 'shortid'
import {CHECKIN, TEAM} from 'universal/utils/constants'
import convertToTaskContent from 'universal/utils/draftjs/convertToTaskContent'
import {makeCheckinGreeting, makeCheckinQuestion} from 'universal/utils/makeCheckinGreeting'
import {sendTeamAccessError, sendTeamMemberNotOnTeamError} from 'server/utils/authorizationErrors'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'

export default {
  type: StartMeetingPayload,
  description: 'Start a meeting from the lobby',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team starting the meeting'
    }
  },
  async resolve (source, {teamId}, {authToken, socketId: mutatorId, dataLoader}) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const userId = getUserId(authToken)
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId)
    }

    // RESOLUTION
    const facilitatorId = toTeamMemberId(teamId, userId)
    const facilitatorMembership = await r.table('TeamMember').get(facilitatorId)
    if (!facilitatorMembership || !facilitatorMembership.isNotRemoved) {
      return sendTeamMemberNotOnTeamError(authToken, {teamId, userId})
    }

    const now = new Date()
    const meetingId = shortid.generate()
    const meetingCount = await r
      .table('Meeting')
      .getAll(teamId, {index: 'teamId'})
      .count()
      .default(0)
      .add(1)

    const updatedTeam = {
      checkInGreeting: makeCheckinGreeting(meetingCount, teamId),
      checkInQuestion: convertToTaskContent(makeCheckinQuestion(meetingCount, teamId)),
      meetingId,
      activeFacilitator: facilitatorId,
      facilitatorPhase: CHECKIN,
      facilitatorPhaseItem: 1,
      meetingPhase: CHECKIN,
      meetingPhaseItem: 1
    }
    await r({
      team: r
        .table('Team')
        .get(teamId)
        .update(updatedTeam),
      meeting: r.table('Meeting').insert({
        id: meetingId,
        createdAt: now,
        meetingNumber: meetingCount,
        teamId,
        teamName: r.table('Team').get(teamId)('name')
      })
    })
    startSlackMeeting(teamId)

    const data = {teamId}
    publish(TEAM, teamId, StartMeetingPayload, data, subOptions)
    return data
  }
}
