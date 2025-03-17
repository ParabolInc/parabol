import {InvoiceItemType, SubscriptionChannel} from 'parabol-client/types/constEnums'
import adjustUserCount from '../../../billing/helpers/adjustUserCount'
import updateUser from '../../../postgres/queries/updateUser'
import {Logger} from '../../../utils/Logger'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import getListeningUserIds, {RedisCommand} from '../../../utils/getListeningUserIds'
import getRedis from '../../../utils/getRedis'
import publish from '../../../utils/publish'
import {DataLoaderWorker} from '../../graphql'
import {MutationResolvers} from '../resolverTypes'

export interface UserPresence {
  lastSeenAtURL: string | null
  socketInstanceId: string
  socketId: string
}

const handleInactive = async (userId: string, dataLoader: DataLoaderWorker) => {
  const orgUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
  const orgIds = orgUsers.map(({orgId}) => orgId)
  await adjustUserCount(userId, orgIds, InvoiceItemType.UNPAUSE_USER, dataLoader).catch(Logger.log)
  // TODO: re-identify
}

const connectSocket: MutationResolvers['connectSocket'] = async (
  _source,
  {socketInstanceId},
  {authToken, dataLoader, socketId}
) => {
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
    handleInactive(userId, dataLoader)
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
    JSON.stringify({lastSeenAtURL: null, socketInstanceId, socketId} as UserPresence)
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

  analytics.websocketConnected(user, {
    socketCount,
    socketId,
    tms
  })
  analytics.identify({
    userId,
    email: user.email,
    isActive: true,
    highestTier: user.tier,
    isPatient0: user.isPatient0
  })
  return user
}

export default connectSocket
