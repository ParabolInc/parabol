import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import getPubSub from '../../../utils/getPubSub'
import {broadcastSubscription} from '../broadcastSubscription'
import {SubscriptionResolvers} from '../resolverTypes'

const meetingSubscription: SubscriptionResolvers['meetingSubscription'] = {
  subscribe: async (_source, {meetingId}, context) => {
    const {authToken} = context
    // AUTH
    const viewerId = getUserId(authToken)
    const meetingMemberId = toTeamMemberId(meetingId, viewerId)
    const meetingMember = await getKysely()
      .selectFrom('MeetingMember')
      .select('id')
      .where('id', '=', meetingMemberId)
      .executeTakeFirst()
    if (!meetingMember) {
      throw new Error('Not invited to the meeting. Cannot subscribe')
    }

    // RESOLUTION
    const channelName = `${SubscriptionChannel.MEETING}.${meetingId}`
    const iter = getPubSub().subscribe([channelName])
    return broadcastSubscription(iter, context)
  }
}

export default meetingSubscription
