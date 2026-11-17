import {sql} from 'kysely'
import ms from 'ms'
import {InvoiceItemType} from '../../client/types/constEnums'
import adjustUserCount from '../billing/helpers/adjustUserCount'
import {getNewDataLoader} from '../dataloader/getNewDataLoader'
import getKysely from '../postgres/getKysely'

// mutates user so a dataloader-cached copy stays current
const recordUserActivity = async (user: {id: string; inactive: boolean; lastSeenAt: Date}) => {
  const {id: userId, inactive, lastSeenAt} = user
  if (inactive) {
    const unpausedUser = await getKysely()
      .updateTable('User')
      .set({inactive: false, lastSeenAt: sql`CURRENT_TIMESTAMP`})
      .where('id', '=', userId)
      .where('inactive', '=', true)
      .returning('lastSeenAt')
      .executeTakeFirst()
    // a concurrent request already unpaused them & recorded the activation
    if (!unpausedUser) return
    user.inactive = false
    user.lastSeenAt = unpausedUser.lastSeenAt
    const dataLoader = getNewDataLoader('recordUserActivity')
    try {
      const orgUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
      const orgIds = orgUsers.map(({orgId}) => orgId)
      await adjustUserCount(userId, orgIds, InvoiceItemType.UNPAUSE_USER, dataLoader)
    } finally {
      dataLoader.dispose()
    }
  } else if (Date.now() - lastSeenAt.getTime() > ms('1m')) {
    const seenUser = await getKysely()
      .updateTable('User')
      .set({lastSeenAt: sql`CURRENT_TIMESTAMP`})
      .where('id', '=', userId)
      .returning('lastSeenAt')
      .executeTakeFirst()
    if (seenUser) user.lastSeenAt = seenUser.lastSeenAt
  }
}

export default recordUserActivity
