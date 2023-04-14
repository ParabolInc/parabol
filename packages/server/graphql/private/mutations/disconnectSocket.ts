import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import PROD from '../../../PROD'
import {analytics} from '../../../utils/analytics/analytics'
import getListeningUserIds, {RedisCommand} from '../../../utils/getListeningUserIds'
import getRedis from '../../../utils/getRedis'
import publish from '../../../utils/publish'
import {UserPresence} from '../../private/mutations/connectSocket'
import {MutationResolvers} from '../resolverTypes'

const disconnectSocket: MutationResolvers['disconnectSocket'] = async (
  _source,
  {userId},
  {dataLoader, socketId}
) => {
  const redis = getRedis()

  // AUTH
  if (!socketId) return undefined

  // RESOLUTION
  const [user, userPresence] = await Promise.all([
    dataLoader.get('users').load(userId),
    redis.lrange(`presence:${userId}`, 0, -1)
  ])
  if (!user) {
    throw new Error('User does not exist')
  }
  const tms = user.tms ?? []
  const disconnectingSocket = userPresence.find(
    (socket) => (JSON.parse(socket) as UserPresence).socketId === socketId
  )
  if (!disconnectingSocket) {
    // this happens a lot on server restart in dev mode
    if (!PROD) return {user}
    throw new Error('Called disconnect without a valid socket')
  }
  await redis.lrem(`presence:${userId}`, 0, disconnectingSocket)

  // If this is the last socket, tell everyone they're offline
  if (userPresence.length === 1) {
    const listeningUserIds = await getListeningUserIds(RedisCommand.REMOVE, tms, userId)
    const subOptions = {mutatorId: socketId}
    const data = {user}
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
  analytics.websocketDisconnected(userId, {
    socketCount: userPresence.length,
    socketId,
    tms
  })
  return {user}
}

export default disconnectSocket
