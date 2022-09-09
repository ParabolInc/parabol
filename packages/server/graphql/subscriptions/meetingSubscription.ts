import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {canJoinMeeting} from '../../utils/authorization'
import getPubSub from '../../utils/getPubSub'
import {GQLContext} from '../graphql'
import MeetingSubscriptionPayload from '../types/MeetingSubscriptionPayload'
export default {
  type: new GraphQLNonNull(MeetingSubscriptionPayload),
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: async (
    _source: unknown,
    {meetingId}: {meetingId: string},
    {authToken}: GQLContext
  ) => {
    // AUTH
    if (!(await canJoinMeeting(authToken, meetingId))) {
      throw new Error('Not invited to the meeting. Cannot subscribe')
    }

    // RESOLUTION
    const channelName = `${SubscriptionChannel.MEETING}.${meetingId}`
    return getPubSub().subscribe([channelName])
  }
}
