import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {makeCheckinQuestion} from 'parabol-client/utils/makeCheckinGreeting'
import {convertTipTapTaskContent} from '../../../client/shared/tiptap/convertTipTapTaskContent'
import getKysely from '../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../utils/authorization'
import getPhase from '../../utils/getPhase'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import UpdateNewCheckInQuestionPayload from '../types/UpdateNewCheckInQuestionPayload'
import {GQLContext} from './../graphql'

export default {
  type: UpdateNewCheckInQuestionPayload,
  description: "Update a Team's Icebreaker in a new meeting",
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'ID of the Team which will have its Icebreaker updated'
    },
    checkInQuestion: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The Team's new Icebreaker"
    }
  },
  async resolve(
    _source: unknown,
    {meetingId, checkInQuestion}: {meetingId: string; checkInQuestion: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const pg = getKysely()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {endedAt, phases, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    if (endedAt) {
      return {error: {message: 'Meeting has already ended'}}
    }
    // VALIDATION
    const normalizedCheckInQuestion =
      checkInQuestion ||
      convertTipTapTaskContent(makeCheckinQuestion(Math.floor(Math.random() * 1000), teamId))

    // RESOLUTION
    const checkInPhase = getPhase(phases, 'checkin')

    // mutative
    checkInPhase.checkInQuestion = normalizedCheckInQuestion
    await pg
      .updateTable('NewMeeting')
      .set({phases: JSON.stringify(phases)})
      .where('id', '=', meetingId)
      .execute()
    dataLoader.clearAll('newMeetings')
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
