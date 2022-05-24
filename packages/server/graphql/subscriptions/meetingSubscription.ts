import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import getRethink from '../../database/rethinkDriver'
import {getUserId} from '../../utils/authorization'
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
    {authToken, socketId}: GQLContext
  ) => {
    // AUTH
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const meetingMemberId = toTeamMemberId(meetingId, viewerId)
    const meetingMember = await r
      .table('MeetingMember')
      .get(meetingMemberId)
      .run()
    if (!meetingMember) {
      throw new Error('Not invited to the meeting. Cannot subscribe')
    }

    // RESOLUTION
    const channelName = `${SubscriptionChannel.MEETING}.${meetingId}`
    return getPubSub().subscribe([channelName], socketId)
  }
}
