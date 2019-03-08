import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import {CHECKIN, TEAM} from 'universal/utils/constants'
import normalizeRawDraftJS from 'universal/validation/normalizeRawDraftJS'
import UpdateNewCheckInQuestionPayload from 'server/graphql/types/UpdateNewCheckInQuestionPayload'
import standardError from 'server/utils/standardError'

export default {
  type: UpdateNewCheckInQuestionPayload,
  description: "Update a Team's Check-in question in a new meeting",
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'ID of the Team which will have its Check-in question updated'
    },
    checkInQuestion: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The Team's new Check-in question"
    }
  },
  async resolve(
    source,
    {meetingId, checkInQuestion},
    {authToken, dataLoader, socketId: mutatorId}
  ) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const now = new Date()
    const viewerId = getUserId(authToken)

    // AUTH
    const meeting = await r.table('NewMeeting').get(meetingId)
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {phases, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const normalizedCheckInQuestion = normalizeRawDraftJS(checkInQuestion)

    // RESOLUTION
    const checkInPhase = phases.find((phase) => phase.phaseType === CHECKIN)
    // mutative
    checkInPhase.checkInQuestion = normalizedCheckInQuestion
    await r
      .table('NewMeeting')
      .get(meetingId)
      .update({
        phases,
        updatedAt: now
      })

    const data = {meetingId}
    publish(TEAM, teamId, UpdateNewCheckInQuestionPayload, data, subOptions)
    return data
  }
}
