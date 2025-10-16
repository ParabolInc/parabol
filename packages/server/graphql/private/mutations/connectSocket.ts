import {InvoiceItemType, SubscriptionChannel} from 'parabol-client/types/constEnums'
import adjustUserCount from '../../../billing/helpers/adjustUserCount'
import updateUser from '../../../postgres/queries/updateUser'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import getRedis, {type RedisPipelineResponse} from '../../../utils/getRedis'
import {Logger} from '../../../utils/Logger'
import publish from '../../../utils/publish'
import type {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'
import type {MutationResolvers} from '../resolverTypes'

const handleInactive = async (userId: string, dataLoader: DataLoaderWorker) => {
  const orgUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
  const orgIds = orgUsers.map(({orgId}) => orgId)
  await adjustUserCount(userId, orgIds, InvoiceItemType.UNPAUSE_USER, dataLoader).catch(Logger.log)
  // TODO: re-identify
}

const connectSocket: MutationResolvers['connectSocket'] = async (
  _source,
  _args,
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
  const [user, highestTier] = await Promise.all([
    dataLoader.get('users').load(userId),
    dataLoader.get('highestTierForUserId').load(userId)
  ])
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
  const [[, socketCount]] = (await redis
    .multi()
    .incr(`awareness:${userId}`)
    .pexpire(`awareness:${userId}`, 10_000)
    .exec()) as [RedisPipelineResponse<number>, RedisPipelineResponse<number>]

  // If this is the first socket, tell everyone they're online
  if (socketCount === 1) {
    const teamUserIds = (await dataLoader.get('teamMembersByTeamId').loadMany(tms))
      .filter(isValid)
      .flat()
      .map((tm) => tm.userId)
    const distinctTeamUserIds = [...new Set(teamUserIds)]
    const operationId = dataLoader.share()
    const subOptions = {mutatorId: socketId, operationId}
    distinctTeamUserIds.forEach((userId) => {
      publish(SubscriptionChannel.NOTIFICATION, userId, 'User', user, subOptions)
    })
  }

  analytics.websocketConnected(user, {
    socketCount: socketCount || 0,
    socketId,
    tms
  })
  analytics.identify({
    userId,
    email: user.email,
    isActive: true,
    highestTier,
    isPatient0: user.isPatient0
  })
  return user
}

export default connectSocket
