import {GraphQLID, GraphQLNonNull} from 'graphql'
import NewMeeting from 'server/graphql/types/NewMeeting'
import {getUserId, isPastOrPresentTeamMember, isTeamMember} from '../../utils/authorization'
import standardError from '../../utils/standardError'

export default {
  type: NewMeeting,
  description: 'A previous meeting that the user was in (present or absent)',
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The meeting ID'
    }
  },
  async resolve (_source, {meetingId}, {authToken, dataLoader}) {
    const viewerId = getUserId(authToken)
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      if (!(await isPastOrPresentTeamMember(viewerId, teamId))) {
        standardError(new Error('Team not found'), {userId: viewerId})
        return null
      }
    }
    return meeting
  }
}
