import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getUserId} from '../../../utils/authorization'
import getListeningUserIds, {RedisCommand} from '../../../utils/getListeningUserIds'
import getRedis from '../../../utils/getRedis'
import publish from '../../../utils/publish'
import segmentIo from '../../../utils/segmentIo'
import {UserPresence} from '../../private/mutations/connectSocket'
import {MutationResolvers} from '../resolverTypes'

const disconnectSocket: MutationResolvers['disconnectSocket'] = async (
  _source,
  _args,
  {authToken, dataLoader, socketId}
) => {
  // Note: no server secret means a client could call this themselves & appear disconnected when they aren't!
  const redis = getRedis()

  // AUTH
  if (!socketId) return undefined
  const userId = getUserId(authToken)

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
  segmentIo.track({
    userId,
    event: 'Disconnect WebSocket',
    properties: {
      socketCount: userPresence.length,
      socketId,
      tms
    }
  })
  return {user}
}

export default disconnectSocket
