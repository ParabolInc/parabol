import {InvoiceItemType} from 'parabol-client/types/constEnums'
import adjustUserCount from '../../../billing/helpers/adjustUserCount'
import updateUser from '../../../postgres/queries/updateUser'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import {Logger} from '../../../utils/Logger'
import type {DataLoaderWorker} from '../../graphql'
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
  const {inactive, lastSeenAt} = user

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
