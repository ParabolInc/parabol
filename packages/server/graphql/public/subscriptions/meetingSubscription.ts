import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import getRethink from '../../../database/rethinkDriver'
import {getUserId} from '../../../utils/authorization'
import getPubSub from '../../../utils/getPubSub'
import {SubscriptionResolvers} from '../resolverTypes'

const meetingSubscription: SubscriptionResolvers['meetingSubscription'] = {
  subscribe: async (_source, {meetingId}, {authToken}) => {
    // AUTH
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const meetingMemberId = toTeamMemberId(meetingId, viewerId)
    const meetingMember = await r.table('MeetingMember').get(meetingMemberId).run()
    if (!meetingMember) {
      throw new Error('Not invited to the meeting. Cannot subscribe')
    }

    // RESOLUTION
    const channelName = `${SubscriptionChannel.MEETING}.${meetingId}`
    return getPubSub().subscribe([channelName])
  }
}

export default meetingSubscription
