import {GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {isNotNull} from 'parabol-client/utils/predicates'
import {getUserId} from '../../utils/authorization'
import getRedis from '../../utils/getRedis'
import publish from '../../utils/publish'
import sendToSentry from '../../utils/sendToSentry'
import {GQLContext} from '../graphql'
import {UserPresence} from '../private/mutations/connectSocket'
import rateLimit from '../rateLimit'
import SetAppLocationPayload from '../types/SetAppLocationPayload'

export default {
  type: new GraphQLNonNull(SetAppLocationPayload),
  description: `Share where in the app the viewer is`,
  args: {
    location: {
      type: GraphQLString,
      description: 'The location the viewer is currently at'
    }
  },
  // rate limited because a notificationId subverts the expiration of the token & we don't want any brute forces for expired tokens
  resolve: rateLimit({
    perMinute: 50,
    perHour: 100
  })(
    async (
      _source: unknown,
      {location}: {location: string | null},
      {authToken, dataLoader, socketId: mutatorId}: GQLContext
    ) => {
      const operationId = dataLoader.share()
      const subOptions = {mutatorId, operationId}
      const redis = getRedis()
      if (!mutatorId) {
        sendToSentry(new Error('No mutator id in setAppLocation.ts'))
      }

      // AUTH
      const viewerId = getUserId(authToken)
      const viewer = viewerId ? await dataLoader.get('users').load(viewerId) : null
      if (!viewer) {
        return {error: {message: 'Not a user'}}
      }
      const userPresence = await redis.lrange(`presence:${viewerId}`, 0, -1)
      const connections = userPresence.map((presence) => JSON.parse(presence) as UserPresence)
      const connectedSocketIdx = connections.findIndex(({socketId}) => socketId === mutatorId)
      if (connectedSocketIdx === -1) {
        return {error: {message: "Socket doesn't exist"}}
      }
      const connectedSocketStr = userPresence[connectedSocketIdx]!
      const connectedSocket = connections[connectedSocketIdx]!

      // RESOLUTION
      const {lastSeenAtURL, socketId, serverId} = connectedSocket
      const data = {userId: viewerId}
      if (lastSeenAtURL !== location) {
        const updatedConnection = {
          socketId,
          serverId,
          lastSeenAtURL: location
        }
        const [lastMeetingId, nextMeetingId] = [lastSeenAtURL, location].map((url) => {
          const meetPrefix = '/meet/'
          return url?.includes(meetPrefix) ? url.slice(meetPrefix.length) : null
        })

        const [lastMeeting, nextMeeting] = await Promise.all([
          lastMeetingId ? dataLoader.get('newMeetings').load(lastMeetingId) : undefined,
          nextMeetingId ? dataLoader.get('newMeetings').load(nextMeetingId) : undefined,
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
      return data
    }
  )
}
