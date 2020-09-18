import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import db from '../../../db'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import segmentIo from '../../../utils/segmentIo'
import {GQLContext} from '../../graphql'
import DisconnectSocketPayload from '../../types/DisconnectSocketPayload'
import getRedis from '../../../utils/getRedis'
import {UserPresence} from './connectSocket'
import getListeningUserIds from '../../../utils/getListeningUserIds'
export default {
  name: 'DisconnectSocket',
  description: 'a server-side mutation called when a client disconnects',
  type: DisconnectSocketPayload,
  resolve: async (_source, _args, {authToken, socketId}: GQLContext) => {
    // Note: no server secret means a client could call this themselves & appear disconnected when they aren't!
    const redis = getRedis()

    // AUTH
    if (!socketId) return undefined
    const userId = getUserId(authToken)

    // RESOLUTION
    const user = await db.read('User', userId)
    const {tms} = user
    const userPresence = await redis.lrange(`presence:${userId}`, 0, -1)
    const parsedUserPresence = userPresence.map((socket) => JSON.parse(socket)) as UserPresence[]
    const disconnectingSocket = parsedUserPresence.find((socket) => socket.socketId === socketId)
    if (!disconnectingSocket) {
      throw new Error('Called disconnect without a valid socket')
    }
    await redis.lrem(`presence:${userId}`, 0, JSON.stringify(disconnectingSocket))

    // If this is the last socket, tell everyone they're offline
    if (userPresence.length === 1) {
      const listeningUserIds = new Set()
      await redis.srem('onlineUserIds', userId)
      for (const teamId of tms) {
        let teamMembers
        await redis
          .multi()
          .smembers(`team:${teamId}`)
          .srem(`team:${teamId}`, userId)
          .exec((execErr, results) => {
            if (execErr) throw new Error('Failed to execute redis command in disconnectSocket')
            results.forEach((res, index) => {
              if (index === 0 && !res[0]) {
                teamMembers = res[1]
              }
            })
          })

        // const teamMembers = await redis.smembers(`team:${teamId}`)
        // await redis.srem(`team:${teamId}`, userId)
        if ((await redis.llen(`team:${teamId}`)) === 0) {
          await redis.srem(`onlineTeamIds`, teamId)
        }
        for (const teamMemberUserId of teamMembers) {
          listeningUserIds.add(teamMemberUserId)
        }
      }
      const subOptions = {mutatorId: socketId}
      const data = {user}
      const listeningUserIdsArr = Array.from(listeningUserIds) as string[]
      listeningUserIdsArr.forEach((onlineUserId) => {
        publish(
          SubscriptionChannel.NOTIFICATION,
          onlineUserId,
          'DisconnectSocketPayload',
          data,
          subOptions
        )
      })
    }
    segmentIo.track({
      userId,
      event: 'Disconnect WebSocket',
      properties: {
        connectedSockets: userPresence.map((socket) => JSON.parse(socket).socketId),
        socketId,
        tms
      }
    })
    return {user}
  }
}
