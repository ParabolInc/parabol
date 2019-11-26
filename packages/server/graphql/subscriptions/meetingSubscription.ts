import {GraphQLID, GraphQLNonNull} from 'graphql'
import makeSubscribeIter from '../makeSubscribeIter'
import MeetingSubscriptionPayload from '../types/MeetingSubscriptionPayload'
import {getUserId} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

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
    const filterFn = (value) => value.mutatorId !== socketId
    const resolve = ({data}) => ({meetingSubscription: data})
    return makeSubscribeIter(channelName, {filterFn, dataLoader, resolve})
  }
}
