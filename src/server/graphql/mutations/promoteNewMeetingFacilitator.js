import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import publish from 'server/utils/publish'
import {TEAM} from 'universal/utils/constants'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import PromoteNewMeetingFacilitatorPayload from 'server/graphql/types/PromoteNewMeetingFacilitatorPayload'
import standardError from 'server/utils/standardError'

export default {
  type: PromoteNewMeetingFacilitatorPayload,
  description: 'Change a facilitator while the meeting is in progress',
  args: {
    facilitatorUserId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'userId of the new facilitator for this meeting'
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve (
    source,
    {facilitatorUserId, meetingId},
    {authToken, dataLoader, socketId: mutatorId}
  ) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const now = new Date()
    const viewerId = getUserId(authToken)

    // AUTH
    const meeting = await r
      .table('NewMeeting')
      .get(meetingId)
      .default(null)
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {facilitatorUserId: oldFacilitatorUserId, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const newFacilitator = await dataLoader.get('users').load(facilitatorUserId)
    if (!newFacilitator.tms.includes(teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    await r
      .table('NewMeeting')
      .get(meetingId)
      .update({
        facilitatorUserId,
        updatedAt: now
      })

    const data = {meetingId, oldFacilitatorUserId}
    publish(TEAM, teamId, PromoteNewMeetingFacilitatorPayload, data, subOptions)
    return data
  }
}
