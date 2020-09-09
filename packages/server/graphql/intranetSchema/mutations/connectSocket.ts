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
    const redis = getRedis()
    const now = new Date()

    // AUTH
    if (!socketId) {
      throw new Error('Called connect without a valid socket')
    }
    const userId = getUserId(authToken)

    // RESOLUTION
    const user = await db.read('User', userId)
    const {inactive, lastSeenAt, tms} = user

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

    const datesAreOnSameDay = lastSeenAt && now.toDateString() === lastSeenAt.toDateString()
    if (!datesAreOnSameDay) {
      await db.write('User', userId, {lastSeenAt: now})
    }
    const userPresence = await redis.lrange(`presence:${userId}`, 0, -1)
    const connectedSockets = userPresence.map((socket) => JSON.parse(socket).socketId)
    await redis.rpush(
      `presence:${userId}`,
      JSON.stringify({lastSeenAtURL: null, serverId: 'server1', socketId} as UserPresence)
    )
    const updatedUserPresence = await redis.lrange(`presence:${userId}`, 0, -1)
    const updatedConnectedSockets = updatedUserPresence.map((socket) => JSON.parse(socket).socketId)
    user.connectedSockets = updatedConnectedSockets

    const listeningUserIds = new Set()
    for (const teamId of tms) {
      await redis.sadd(`team:${teamId}`, userId)
      const teamMembers = await redis.smembers(`team:${teamId}`)
      for (const teamMemberId of teamMembers) {
        listeningUserIds.add(teamMemberId)
      }
    }

    // If this is the first socket, tell everyone they're online
    if (connectedSockets.length === 0) {
      const operationId = dataLoader.share()
      const subOptions = {mutatorId: socketId, operationId}
      const listeningUserIdsArr = Array.from(listeningUserIds) as string[]
      listeningUserIdsArr.forEach((onlineUserId) => {
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
