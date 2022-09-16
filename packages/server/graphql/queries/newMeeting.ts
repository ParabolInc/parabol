import {GraphQLID, GraphQLNonNull} from 'graphql'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {getUserId, isTeamMember} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import NewMeeting from '../types/NewMeeting'
import {GQLContext} from './../graphql'

export default {
  type: NewMeeting,
  description: 'A previous meeting that the user was in (present or absent)',
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The meeting ID'
    }
  },
  async resolve(
    _source: unknown,
    {meetingId}: {meetingId: string},
    {authToken, dataLoader}: GQLContext
  ) {
    const viewerId = getUserId(authToken)
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting) {
      standardError(new Error('Meeting not found'), {userId: viewerId, tags: {meetingId}})
      return null
    }
    const {teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      const meetingMemberId = toTeamMemberId(meetingId, viewerId)
      const meetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
      if (!meetingMember) {
        // standardError(new Error('Team not found'), {userId: viewerId, tags: {teamId}})
        return null
      }
    }
    return meeting
  }
}
