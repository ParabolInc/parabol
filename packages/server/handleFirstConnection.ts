import {sql} from 'kysely'
import {InvoiceItemType, SubscriptionChannel} from '../client/types/constEnums'
import adjustUserCount from './billing/helpers/adjustUserCount'
import {getNewDataLoader} from './dataloader/getNewDataLoader'
import updateUser from './postgres/queries/updateUser'
import {analytics} from './utils/analytics/analytics'
import {getTeamMemberUserIds} from './utils/getTeamMemberUserIds'
import {Logger} from './utils/Logger'
import publish from './utils/publish'

export const handleFirstConnection = async (
  user: {id: string; email: string; inactive: boolean; lastSeenAt: Date},
  teamIds: string[]
) => {
  const userIds = await getTeamMemberUserIds(teamIds)
  userIds.forEach(({userId}) => {
    publish(SubscriptionChannel.NOTIFICATION, userId, 'User', user)
  })
  const {id: userId, email, inactive, lastSeenAt} = user
  if (inactive) {
    const dataLoader = getNewDataLoader('wsHandler.onConnect')
    const orgUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
    const orgIds = orgUsers.map(({orgId}) => orgId)
    await Promise.all([
      updateUser({inactive: false, lastSeenAt: sql`CURRENT_TIMESTAMP`}, userId),
      adjustUserCount(userId, orgIds, InvoiceItemType.UNPAUSE_USER, dataLoader)
    ]).catch(Logger.log)

    dataLoader.dispose()
    analytics.identify({
      userId: userId,
      email,
      isActive: true
    })
  } else if (new Date().toDateString() !== lastSeenAt.toDateString()) {
    updateUser({lastSeenAt: sql`CURRENT_TIMESTAMP`}, userId).catch(Logger.log)
  }
}
