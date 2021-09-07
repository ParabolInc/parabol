import removeSlackAuths from './removeSlackAuths'
import removeFromOrg from './removeFromOrg'
import getDeletedEmail from '../../../utils/getDeletedEmail'
import {USER_REASON_REMOVED_LIMIT} from '../../../postgres/constants'
import updateUser from '../../../postgres/queries/updateUser'
import segmentIo from '../../../utils/segmentIo'
import db from '../../../db'
import User from '../../../database/types/User'
import {DataLoaderWorker} from '../../graphql'

const softDeleteUser = async (user: User, dataLoader: DataLoaderWorker, reason?: string,) => {
  const {id: userIdToDelete, tms} = user
  removeSlackAuths(userIdToDelete, tms, true)
  const orgUsers = await dataLoader.get('organizationUsersByUserId').load(userIdToDelete)
  const orgIds = orgUsers.map((orgUser) => orgUser.orgId)
  await Promise.all(
    orgIds.map((orgId) => removeFromOrg(userIdToDelete, orgId, undefined, dataLoader))
  )
  const validReason = reason?.trim().slice(0, USER_REASON_REMOVED_LIMIT) || 'No reason provided'
  if (userIdToDelete) {
    segmentIo.track({
      userId: userIdToDelete,
      event: 'Account Removed',
      properties: {
        reason: validReason
      }
    })
  }
  // do this after 30 seconds so any segment API calls can still get the email
  const update = {
    isRemoved: true,
    email: getDeletedEmail(userIdToDelete),
    reasonRemoved: validReason,
    updatedAt: new Date()
  }
  setTimeout(() => {
    db.write('User', userIdToDelete, update)
    updateUser(update, userIdToDelete)
  }, 30000)
}

export default softDeleteUser
