import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import getPubSub from '../../../utils/getPubSub'
import {SubscriptionResolvers} from '../resolverTypes'

const meetingSubscription: SubscriptionResolvers['meetingSubscription'] = {
  subscribe: async (_source, {meetingId}, {authToken}) => {
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
    return getPubSub().subscribe([channelName])
  }
}

export default meetingSubscription
