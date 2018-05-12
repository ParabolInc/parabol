import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import {TEAM} from 'universal/utils/constants'
import {sendTeamAccessError} from 'server/utils/authorizationErrors'
import NewMeetingCheckInPayload from 'server/graphql/types/NewMeetingCheckInPayload'
import {sendAlreadyEndedMeetingError} from 'server/utils/alreadyMutatedErrors'
import {sendMeetingNotFoundError} from 'server/utils/docNotFoundErrors'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'

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
  async resolve (
    source,
    {userId, meetingId, isCheckedIn},
    {authToken, dataLoader, socketId: mutatorId}
  ) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const meeting = await r
      .table('NewMeeting')
      .get(meetingId)
      .default(null)
    if (!meeting) return sendMeetingNotFoundError(authToken, meetingId)
    const {endedAt, teamId} = meeting
    if (endedAt) return sendAlreadyEndedMeetingError(authToken, meetingId)
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId)
    }

    // RESOLUTION
    const meetingMemberId = toTeamMemberId(meetingId, userId)
    await r
      .table('MeetingMember')
      .get(meetingMemberId)
      .update({isCheckedIn})

    const data = {meetingId, userId}
    publish(TEAM, teamId, NewMeetingCheckInPayload, data, subOptions)
    return data
  }
}
