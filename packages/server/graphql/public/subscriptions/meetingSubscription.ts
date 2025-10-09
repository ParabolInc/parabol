import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {isNotNull} from '../../../../client/utils/predicates'
import {getNewDataLoader} from '../../../dataloader/getNewDataLoader'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import getPubSub from '../../../utils/getPubSub'
import getRedis from '../../../utils/getRedis'
import logError from '../../../utils/logError'
import publish from '../../../utils/publish'
import {UserPresence} from '../../private/mutations/connectSocket'
import {broadcastSubscription} from '../broadcastSubscription'
import type {SubscriptionResolvers} from '../resolverTypes'

const meetingSubscription: SubscriptionResolvers['meetingSubscription'] = {
  subscribe: async (_source, {meetingId}, context) => {
    const {authToken, socketId: mutatorId} = context
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

    // Update presence
    const updatePresence = async (location: string | null) => {
      const dataLoader = getNewDataLoader('meetingSubscription')
      const operationId = dataLoader.share()
      dataLoader.dispose()
      // don't include mutatorId, the viewer should get the update as well
      const subOptions = {operationId}

      const redis = getRedis()
      const userPresence = await redis.lrange(`presence:${viewerId}`, 0, -1)
      const connections = userPresence.map((presence) => JSON.parse(presence) as UserPresence)
      const connectedSocketIdx = connections.findIndex(({socketId}) => socketId === mutatorId)
      if (connectedSocketIdx === -1) {
        throw new Error("Socket doesn't exist")
      }
      const connectedSocketStr = userPresence[connectedSocketIdx]!
      const connectedSocket = connections[connectedSocketIdx]!

      const {lastSeenAtURL, socketId, socketInstanceId} = connectedSocket
      const data = {userId: viewerId}
      if (lastSeenAtURL !== location) {
        const updatedConnection = {
          socketId,
          socketInstanceId,
          lastSeenAtURL: location
        }
        const [lastMeetingId, nextMeetingId] = [lastSeenAtURL, location].map((url) => {
          const meetPrefix = '/meet/'
          return url?.includes(meetPrefix) ? url.slice(meetPrefix.length) : null
        })

        const [lastMeeting, nextMeeting] = await Promise.all([
          lastMeetingId ? dataLoader.get('newMeetings').load(lastMeetingId) : null,
          nextMeetingId ? dataLoader.get('newMeetings').load(nextMeetingId) : null,
          redis
            .multi()
            .lrem(`presence:${viewerId}`, 0, connectedSocketStr)
            .rpush(`presence:${viewerId}`, JSON.stringify(updatedConnection))
            .exec()
        ])

        const meetings = [lastMeeting, nextMeeting]
        const uniqueTeamIds = Array.from(
          new Set(meetings.filter(isNotNull).map(({teamId}) => teamId))
        )
        uniqueTeamIds.forEach((teamId) => {
          publish(SubscriptionChannel.TEAM, teamId, 'SetAppLocationSuccess', data, subOptions)
        })
      }
    }

    const catchError = (error: Error) => {
      logError(error, {userId: viewerId})
    }
    updatePresence('/meet/' + meetingId).catch(catchError)
    const onCompletedHandler = () => {
      updatePresence(null).catch(catchError)
    }

    // RESOLUTION
    const channelName = `${SubscriptionChannel.MEETING}.${meetingId}`
    const iter = await getPubSub().subscribe([channelName], onCompletedHandler)
    return broadcastSubscription(iter, context)
  }
}

export default meetingSubscription
