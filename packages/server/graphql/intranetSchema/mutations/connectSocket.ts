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
import hydrateRedisDoc from '../../../dataloader/hydrateRedisDoc'

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
    // const test = await redis.get(`User:${userId}`)
    // if (!test) return null
    // const testing = hydrateRedisDoc(test, 'lastSeenAt')
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
      await db.write('User', userId, {inactive: false, lastSeenAt: now})
    }

    let socketCount
    await redis
      .multi()
      .sadd('onlineUserIds', userId)
      .rpush(
        `presence:${userId}`,
        JSON.stringify({lastSeenAtURL: null, serverId: 'server1', socketId} as UserPresence)
      )
      .exec((execErr, results) => {
        if (execErr) throw new Error('Failed to execute redis command in connectSocket')
        results.forEach((res, index) => {
          if (index === 1 && !res[0]) {
            socketCount = res[1]
          }
        })
      })
    const listeningUserIds = new Set()

    for (const teamId of tms) {
      let teamMembers
      await redis
        .multi()
        .sadd(`team:${teamId}`, userId)
        .sadd('onlineTeamIds', teamId)
        .smembers(`team:${teamId}`)
        .exec((execErr, results) => {
          if (execErr) throw new Error('Failed to execute redis command in connectSocket')
          results.forEach((res, index) => {
            if (index === 2 && !res[0]) {
              teamMembers = res[1]
            }
          })
        })
      for (const teamMemberUserId of teamMembers) {
        listeningUserIds.add(teamMemberUserId)
      }
    }

    // If this is the first socket, tell everyone they're online
    if (socketCount === 1) {
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
        socketCount,
        socketId,
        tms
      }
    })
    return user
  }
}
