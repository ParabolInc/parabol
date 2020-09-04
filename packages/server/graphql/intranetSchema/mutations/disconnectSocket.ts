import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import db from '../../../db'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import segmentIo from '../../../utils/segmentIo'
import {GQLContext} from '../../graphql'
import DisconnectSocketPayload from '../../types/DisconnectSocketPayload'
import getRedis from '../../../utils/getRedis'
export default {
  name: 'DisconnectSocket',
  description: 'a server-side mutation called when a client disconnects',
  type: DisconnectSocketPayload,
  resolve: async (_source, _args, {authToken, socketId}: GQLContext) => {
    // Note: no server secret means a client could call this themselves & appear disconnected when they aren't!
    const r = await getRethink()

    // AUTH
    if (!socketId) return undefined
    const userId = getUserId(authToken)

    // RESOLUTION
    // const reqlUpdater = (user) => ({
    //   lastSeenAtURL: r.branch(
    //     user('connectedSockets')
    //       .count()
    //       .eq(0),
    //     null,
    //     user('lastSeenAtURL')
    //   ),
    //   connectedSockets: user('connectedSockets')
    //     .default([])
    //     .difference([socketId])
    // })
    // const user = await db.write('User', userId, reqlUpdater)

    // REDIS
    const user = await db.read('User', userId)
    delete user.connectedSockets
    const redis = getRedis()
    const userPresence = await redis.lrange(`presence:${userId}`, 0, -1)
    const socketObj = userPresence.find((value) => JSON.parse(value).socketId === socketId)
    if (!socketObj) return
    await redis.lrem(`presence:${userId}`, 0, socketObj)
    const filteredUserPresence = await redis.lrange(`presence:${userId}`, 0, -1)
    const connectedSockets = filteredUserPresence.map((value) => JSON.parse(value).socketId) || []
    // REDIS

    const {tms} = user

    const data = {user}
    if (connectedSockets.length === 0) {
      // if (connectedSockets.length === 0) {
      // If that was the last socket, tell everyone they went offline
      // const listeningUserIds = await r
      //   .table('TeamMember')
      //   .getAll(r.args(tms), {index: 'teamId'})
      //   .filter({isNotRemoved: true})('userId')
      //   .distinct()
      //   .run()

      //redis
      const teamTest = await redis.smembers(`team:${tms}`)
      await redis.srem(`team:${tms}`, userId)
      const listeningUserIds = await redis.smembers(`team:${tms}`)
      //redis

      const subOptions = {mutatorId: socketId}
      listeningUserIds.forEach((onlineUserId) => {
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
        connectedSockets,
        socketId,
        tms
      }
    })
    return data
  }
}
