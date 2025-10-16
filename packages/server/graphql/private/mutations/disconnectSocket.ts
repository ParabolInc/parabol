import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {analytics} from '../../../utils/analytics/analytics'
import getRedis from '../../../utils/getRedis'
import publish from '../../../utils/publish'
import isValid from '../../isValid'
import type {MutationResolvers} from '../resolverTypes'

const disconnectSocket: MutationResolvers['disconnectSocket'] = async (
  _source,
  {userId, socketId},
  {dataLoader}
) => {
  const redis = getRedis()

  // RESOLUTION
  const [user, socketCount] = await Promise.all([
    dataLoader.get('users').load(userId),
    redis.decr(`awareness:${userId}`)
  ])
  if (!user) {
    // user could've been deleted & then key not wiped
    await redis.del(`awareness:${userId}`)
    throw new Error(`User does not exist: ${userId}`)
  }
  const tms = user.tms ?? []
  // If this is the last socket, tell everyone they're offline
  if (socketCount <= 0) {
    const teamUserIds = (await dataLoader.get('teamMembersByTeamId').loadMany(tms))
      .filter(isValid)
      .flat()
      .map((tm) => tm.userId)
    const distinctTeamUserIds = [...new Set(teamUserIds)]
    const subOptions = {mutatorId: socketId}
    const data = {user}
    distinctTeamUserIds.forEach((userId) => {
      publish(SubscriptionChannel.NOTIFICATION, userId, 'DisconnectSocketPayload', data, subOptions)
    })
  }
  analytics.websocketDisconnected(user, {
    socketCount: socketCount + 1,
    socketId,
    tms
  })
  return {user}
}

export default disconnectSocket
