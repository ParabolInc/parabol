import getRethink from '../../database/rethinkDriver'
import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import getPubSub from '../../utils/getPubSub'
import {getUserId} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import MeetingSubscriptionPayload from '../types/MeetingSubscriptionPayload'

export default {
  type: new GraphQLNonNull(MeetingSubscriptionPayload),
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: async (_source, {meetingId}, {authToken}: GQLContext) => {
    // AUTH
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const meetingMemberId = toTeamMemberId(meetingId, viewerId)
    const meetingMember = await r
      .table('MeetingMember')
      .get(meetingMemberId)
      .run()
    if (!meetingMember) {
      return standardError(new Error('Not invited to the meeting'))
    }

    // RESOLUTION
    const channelName = `${SubscriptionChannel.MEETING}.${meetingId}`
    return getPubSub().subscribe([channelName])
  }
}
