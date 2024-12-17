import {USER_BATCH_DELETE_LIMIT} from '../../../postgres/constants'
import {getUsersByEmails} from '../../../postgres/queries/getUsersByEmails'
import {getUserById} from '../../../postgres/queries/getUsersByIds'
import {
  getUserId,
  isSuperUser,
  isUserBillingLeader,
  isUserOrgAdmin
} from '../../../utils/authorization'
import getDomainFromEmail from '../../../utils/getDomainFromEmail'
import {GQLContext} from '../../graphql'
import {markUserSoftDeleted} from '../../mutations/deleteUser'
import softDeleteUser from '../../mutations/helpers/softDeleteUser'
import {MutationResolvers} from '../resolverTypes'

const deleteUsers: MutationResolvers['deleteUsers'] = async (
  _source,
  {emails}: {emails: string[]},
  {authToken, dataLoader}: GQLContext
) => {
  if (emails.length === 0) {
    return {error: {message: 'No emails provided'}}
  }

  if (emails.length > USER_BATCH_DELETE_LIMIT) {
    return {error: {message: `Cannot delete more than ${USER_BATCH_DELETE_LIMIT} users at once`}}
  }

  const su = isSuperUser(authToken)
  const viewerId = getUserId(authToken)
  const viewer = await getUserById(viewerId)
  if (!viewer) return {error: {message: 'Invalid viewer'}}

  const usersToDelete = await getUsersByEmails(emails)
  if (usersToDelete.length === 0) {
    return {error: {message: 'No valid users found to delete'}}
  } else if (usersToDelete.length !== emails.length) {
    const missingEmails = emails.filter(
      (email) => !usersToDelete.some((user) => user.email === email)
    )
    return {error: {message: `Some users were not found: ${missingEmails.join(', ')}`}}
  }

  // First check all permissions before making any changes
  const viewerOrgUsers = await dataLoader.get('organizationUsersByUserId').load(viewerId)
  const permissionChecks = await Promise.all(
    usersToDelete.map(async (userToDelete) => {
      // Super users can delete anyone
      if (su) return {userId: userToDelete.id, hasPermission: true}

      const orgUsers = await dataLoader.get('organizationUsersByUserId').load(userToDelete.id)

      // Check permissions for each org the user belongs to
      const hasOrgPermission = await Promise.all(
        orgUsers.map(async ({orgId}) => {
          const viewerOrgUser = viewerOrgUsers.find((vu) => vu.orgId === orgId)
          if (!viewerOrgUser) return false

          const [isOrgAdmin, isBillingLeader] = await Promise.all([
            isUserOrgAdmin(viewerId, orgId, dataLoader),
            isUserBillingLeader(viewerId, orgId, dataLoader)
          ])

          if (!(isOrgAdmin || isBillingLeader)) return false

          const organization = await dataLoader.get('organizations').loadNonNull(orgId)
          return organization.activeDomain === getDomainFromEmail(userToDelete.email)
        })
      )

      return {
        userId: userToDelete.id,
        hasPermission: hasOrgPermission.some(Boolean)
      }
    })
  )

  // Check if we have permission to delete ALL users
  const unauthorizedUsers = usersToDelete.filter((_, idx) => !permissionChecks[idx]!.hasPermission)
  if (unauthorizedUsers.length > 0) {
    return {
      error: {
        message: `You don't have permission to remove the following users: ${unauthorizedUsers.map((user) => user.email).join(', ')}`
      }
    }
  }

  // If we have permission for all users, perform the deletions
  const deletedUserIds = await Promise.all(
    permissionChecks.map(async ({userId}) => {
      const deletedUserEmail = await softDeleteUser(userId, dataLoader)
      await markUserSoftDeleted(userId, deletedUserEmail, 'Mass user deletion')
      return userId
    })
  )

  return {deletedUserIds}
}

export default deleteUsers
