import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {getUserId} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import MeetingSubscriptionPayload from '../types/MeetingSubscriptionPayload'
import makeStandardSubscription from './makeStandardSubscription'

export default {
  type: new GraphQLNonNull(MeetingSubscriptionPayload),
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: async (_source, {meetingId}, {authToken, dataLoader, socketId}: GQLContext) => {
    // AUTH
    const viewerId = getUserId(authToken)
    const meetingMemberId = toTeamMemberId(meetingId, viewerId)
    const meetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
    if (!meetingMember) {
      return standardError(new Error('Not invited to the meeting'))
    }

    // RESOLUTION
    const channelName = `${SubscriptionChannel.MEETING}.${meetingId}`
    return makeStandardSubscription('meetingSubscription', [channelName], socketId, dataLoader)
  }
}
