import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import NewMeetingCheckInPayload from '../types/NewMeetingCheckInPayload'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import standardError from '../../utils/standardError'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import sendMeetingJoinToSegment from './helpers/sendMeetingJoinToSegment'

export default {
  type: NewMeetingCheckInPayload,
  description: 'Check a member in as present or absent',
  args: {
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the user being marked present or absent'
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the meeting currently in progress'
    },
    isCheckedIn: {
      type: GraphQLBoolean,
      description: 'true if the member is present, false if absent, null if undecided'
    }
  },
  async resolve(
    _source,
    {userId, meetingId, isCheckedIn},
    {authToken, dataLoader, socketId: mutatorId}
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)
    // AUTH
    const meeting = await r.table('NewMeeting').get(meetingId).default(null).run()
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {endedAt, teamId} = meeting
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    const meetingMemberId = toTeamMemberId(meetingId, userId)
    await r.table('MeetingMember').get(meetingMemberId).update({isCheckedIn}).run()

    const data = {meetingId, userId}
    sendMeetingJoinToSegment(userId, meeting)
    publish(SubscriptionChannel.MEETING, meetingId, 'NewMeetingCheckInPayload', data, subOptions)
    return data
  }
}
