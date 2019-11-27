import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {CHECKIN} from '../../../client/utils/constants'
import normalizeRawDraftJS from '../../../client/validation/normalizeRawDraftJS'
import UpdateNewCheckInQuestionPayload from '../types/UpdateNewCheckInQuestionPayload'
import standardError from '../../utils/standardError'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

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
    _source,
    {meetingId, checkInQuestion},
    {authToken, dataLoader, socketId: mutatorId}
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const now = new Date()
    const viewerId = getUserId(authToken)

    // AUTH
    const meeting = await r
      .table('NewMeeting')
      .get(meetingId)
      .run()
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
      .run()

    const data = {meetingId}
    publish(
      SubscriptionChannel.MEETING,
      meetingId,
      'UpdateNewCheckInQuestionPayload',
      data,
      subOptions
    )
    return data
  }
}
