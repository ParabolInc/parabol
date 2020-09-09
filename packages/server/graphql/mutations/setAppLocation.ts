import {GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import db from '../../db'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import rateLimit from '../rateLimit'
import SetAppLocationPayload from '../types/SetAppLocationPayload'
import getRedis from '../../utils/getRedis'
import {UserPresence} from '../intranetSchema/mutations/connectSocket'

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
  })(async (_source, {location}, {authToken, dataLoader, socketId: mutatorId}) => {
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    const viewer = viewerId ? await dataLoader.get('users').load(viewerId) : null
    if (!viewer) {
      return {error: {message: 'Not a user'}}
    }

    // RESOLUTION

    // redis
    const redis = getRedis()
    const userPresence = await redis.lrange(`presence:${viewerId}`, 0, -1)
    console.log('app loc --- userPresence', userPresence)
    const connectedSocket = userPresence.find((socket) => JSON.parse(socket).socketId === mutatorId)
    if (!connectedSocket) {
      return {error: {message: "Socket doesn't exist"}}
    }
    const parsedConnectedSocket = JSON.parse(connectedSocket) as UserPresence
    const {lastSeenAtURL} = parsedConnectedSocket
    // redis

    // const {lastSeenAtURL} = viewer
    const {lastSeenAt} = viewer
    // const lastSeenAt = new Date()
    const now = new Date()
    const datesAreOnSameDay = now.toDateString() === lastSeenAt.toDateString()
    if (!datesAreOnSameDay) {
      await db.write('User', viewerId, {lastSeenAt: now})
    }

    const data = {userId: viewerId}
    if (lastSeenAtURL !== location) {
      // await db.write('User', viewerId, {lastSeenAt, lastSeenAtURL: location})
      parsedConnectedSocket.lastSeenAtURL = location
      await redis.lrem(`presence:${viewerId}`, 0, connectedSocket)
      await redis.rpush(`presence:${viewerId}`, JSON.stringify(parsedConnectedSocket))
      const userPresenceTest = await redis.lrange(`presence:${viewerId}`, 0, -1)
      console.log('userPresenceTest', userPresenceTest)

      const meetingId = lastSeenAtURL?.includes('/meet/')
        ? lastSeenAtURL.slice(6)
        : location?.includes('/meet/')
        ? location.slice(6)
        : null

      viewer.lastSeenAtURL = location
      // viewer.lastSeenAtURL = location
      // viewer.lastSeenAt // TODO: comment what does this do
      if (meetingId) {
        publish(SubscriptionChannel.MEETING, meetingId, 'SetAppLocationSuccess', data, subOptions)
      }
    }
    return data
  })
}
