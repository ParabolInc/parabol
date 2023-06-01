import {InvoiceItemType, SubscriptionChannel} from 'parabol-client/types/constEnums'
import adjustUserCount from '../../../billing/helpers/adjustUserCount'
import getRethink from '../../../database/rethinkDriver'
import updateUser from '../../../postgres/queries/updateUser'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import getListeningUserIds, {RedisCommand} from '../../../utils/getListeningUserIds'
import getRedis from '../../../utils/getRedis'
import publish from '../../../utils/publish'
import segmentIo from '../../../utils/segmentIo'
import {MutationResolvers} from '../resolverTypes'

export interface UserPresence {
  lastSeenAtURL: string | null
  socketServerId: string
  socketId: string
}
const connectSocket: MutationResolvers['connectSocket'] = async (
  _source,
  {socketServerId},
  {authToken, dataLoader, socketId}
) => {
  const r = await getRethink()
  const redis = getRedis()
  const now = new Date()

  // AUTH
  if (!socketId) {
    throw new Error('Called connect without a valid socket')
  }
  const userId = getUserId(authToken)

  // RESOLUTION
  const user = await dataLoader.get('users').load(userId)
  if (!user) {
    throw new Error('User does not exist')
  }
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
  const datesAreOnSameDay = now.toDateString() === lastSeenAt.toDateString()
  if (!datesAreOnSameDay) {
    await updateUser(
      {
        inactive: false,
        lastSeenAt: now
      },
      userId
    )
  }
  const socketCount = await redis.rpush(
    `presence:${userId}`,
    JSON.stringify({lastSeenAtURL: null, socketServerId, socketId} as UserPresence)
  )

  // If this is the first socket, tell everyone they're online
  if (socketCount === 1) {
    const listeningUserIds = await getListeningUserIds(RedisCommand.ADD, tms, userId)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId: socketId, operationId}
    listeningUserIds.forEach((onlineUserId) => {
      publish(SubscriptionChannel.NOTIFICATION, onlineUserId, 'User', user, subOptions)
    })
  }

  analytics.websocketConnected(userId, {
    socketCount,
    socketId,
    tms
  })
  segmentIo.identify({
    userId,
    traits: {
      email: user.email,
      isActive: true,
      featureFlags: user.featureFlags,
      highestTier: user.tier,
      isPatient0: user.isPatient0
    }
  })
  return user
}

export default connectSocket
