import {GraphQLNonNull} from 'graphql'
import {InvoiceItemType, SubscriptionChannel} from 'parabol-client/types/constEnums'
import adjustUserCount from '../../../billing/helpers/adjustUserCount'
import getRethink from '../../../database/rethinkDriver'
import db from '../../../db'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import segmentIo from '../../../utils/segmentIo'
import {GQLContext} from '../../graphql'
import User from '../../types/User'
import getRedis from '../../../utils/getRedis'

export interface UserPresence {
  lastSeenAtURL: string | null
  serverId: string
  socketId: string
}
export default {
  name: 'ConnectSocket',
  description: 'a server-side mutation called when a client connects',
  type: GraphQLNonNull(User),
  resolve: async (_source, _args, {authToken, dataLoader, socketId}: GQLContext) => {
    const r = await getRethink()
    const now = new Date()

    // AUTH
    if (!socketId) {
      throw new Error('Called connect without a valid socket')
    }
    const userId = getUserId(authToken)

    // RESOLUTION
    const user = await db.read('User', userId)

    const reqlUpdater = (user) => ({
      inactive: false,
      updatedAt: now,
      lastSeenAt: now
      // lastSeenAtURL: null,
      // connectedSockets: user('connectedSockets')
      //   .default([])
      //   .append(socketId)
    })

    await db.write('User', userId, reqlUpdater)

    // const {inactive, connectedSockets, tms} = user
    const {inactive, tms} = user

    // redis
    const redis = getRedis()
    // await redis.rpush(
    //   `presence:${userId}`,
    //   JSON.stringify({socketId, serverId: 'server1', lastSeenAtURL: null})
    // )
    const userPresence = await redis.lrange(`presence:${userId}`, 0, -1)
    const connectedSockets = userPresence.map((value) => JSON.parse(value).socketId)
    await redis.rpush(
      `presence:${userId}`,
      JSON.stringify({lastSeenAtURL: null, serverId: 'server1', socketId} as UserPresence)
    )
    const updatedUserPresence = await redis.lrange(`presence:${userId}`, 0, -1)
    console.log('connect -> userId', userId)
    console.log('connect -> updatedUserPresence', updatedUserPresence)
    const updatedConnectedSockets = updatedUserPresence.map((value) => JSON.parse(value).socketId)
    user.connectedSockets = updatedConnectedSockets

    // update team
    await redis.sadd(`team:${tms}`, userId)
    const listeningUserIds = await redis.smembers(`team:${tms}`)
    if (!listeningUserIds) return
    // redis

    // no need to wait for this, it's just for billing
    if (inactive) {
      const orgIds = await r
        .table('OrganizationUser')
        .getAll(userId, {index: 'userId'})
        .filter({removedAt: null, inactive: true})('orgId')
        .run()
      adjustUserCount(userId, orgIds, InvoiceItemType.UNPAUSE_USER).catch(console.log)
      // TODO: re-identify
    }

    // if (connectedSockets.length === 0) {
    if (connectedSockets.length === 0) {
      const operationId = dataLoader.share()
      const subOptions = {mutatorId: socketId, operationId}

      // remove below for redis
      // const listeningUserIdsOld = (await r
      //   .table('TeamMember')
      //   .getAll(r.args(tms), {index: 'teamId'})
      //   .filter({isNotRemoved: true})('userId')
      //   .distinct()
      //   .run()) as string[]

      // Tell everyone this user is now online
      // listeningUserIds.forEach((onlineUserId) => {
      //   publish(SubscriptionChannel.NOTIFICATION, onlineUserId, 'User', user, subOptions)
      // })
      listeningUserIds.forEach((onlineUserId) => {
        publish(SubscriptionChannel.NOTIFICATION, onlineUserId, 'User', user, subOptions)
      })
    }
    segmentIo.track({
      userId,
      event: 'Connect WebSocket',
      properties: {
        connectedSockets,
        socketId,
        tms
      }
    })
    return user
  }
}
