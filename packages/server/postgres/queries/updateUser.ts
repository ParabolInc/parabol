import type {UpdateObject} from 'kysely'
import getKysely from '../getKysely'
import type {DB} from '../types/pg'

const updateUser = async (update: UpdateObject<DB, 'User', 'User'>, userIds: string | string[]) => {
  const dbUserIds = typeof userIds === 'string' ? [userIds] : userIds
  if (dbUserIds.length === 0) return
  // TODO bust the redis cache here, if we start caching users in redis
  return getKysely().updateTable('User').set(update).where('id', 'in', dbUserIds).execute()
}

export default updateUser
