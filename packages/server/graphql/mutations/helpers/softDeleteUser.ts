import removeSlackAuths from './removeSlackAuths'
import removeFromOrg from './removeFromOrg'
import getDeletedEmail from '../../../utils/getDeletedEmail'
import {USER_REASON_REMOVED_LIMIT} from '../../../postgres/constants'
import updateUser from '../../../postgres/queries/updateUser'
import segmentIo from '../../../utils/segmentIo'
import db from '../../../db'
import User from '../../../database/types/User'
import {DataLoaderWorker} from '../../graphql'
import {IGetUsersByIdResult} from '../../../postgres/queries/getUsersById'
import removeGitHubAuth from '../../../postgres/queries/removeGitHubAuth'
import removeAtlassianAuth from '../../../postgres/queries/removeAtlassianAuth'

const removeGitHubAuths = async (userId: string, teamIds: string[]) => {
  const promises: Promise<void>[] = []
  for (const teamId of teamIds) {
    promises.push(removeGitHubAuth(userId, teamId))
  }
  await Promise.all(promises)
}

const removeAtlassianAuths = async (userId: string, teamIds: string[]) => {
  const promises: Promise<void>[] = []
  for (const teamId of teamIds) {
    promises.push(removeAtlassianAuth(userId, teamId))
  }
  await Promise.all(promises)
}

const softDeleteUser = async (
  user: IGetUsersByIdResult | User,
  dataLoader: DataLoaderWorker,
  reason?: string,
  dontRemoveUser: boolean = false
) => {
  const {id: userIdToDelete, tms} = user
  removeAtlassianAuths(userIdToDelete, tms)
  removeGitHubAuths(userIdToDelete, tms)
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
  if (dontRemoveUser) {
    return
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
