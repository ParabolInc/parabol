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
    return {error: {message: 'No any emails were provided'}}
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
  }

  const viewerOrgUsers = await dataLoader.get('organizationUsersByUserId').load(viewerId)
  const viewerTeamMembers = await dataLoader.get('teamMembersByUserId').load(viewerId)

  // Pre-compute org-level permissions
  const viewerOrgPermissions = await Promise.all(
    viewerOrgUsers.map(async (orgUser) => ({
      orgId: orgUser.orgId,
      isOrgAdmin: await isUserOrgAdmin(viewerId, orgUser.orgId, dataLoader),
      isBillingLeader: await isUserBillingLeader(viewerId, orgUser.orgId, dataLoader)
    }))
  )

  // Pre-compute team-level permissions
  const viewerTeamLeadPermissions = new Set(
    viewerTeamMembers.filter((tm) => tm.isLead).map((tm) => tm.teamId)
  )

  // Now check permissions for each user to delete
  const userPermissions = await Promise.all(
    usersToDelete.map(async (userToDelete) => {
      if (!userToDelete) return false

      const orgUsers = await dataLoader.get('organizationUsersByUserId').load(userToDelete.id)
      const teamMembers = await dataLoader.get('teamMembersByUserId').load(userToDelete.id)

      // Check org-level permissions and domain ownership
      const hasOrgPermission = await Promise.all(
        orgUsers.map(async (orgUser) => {
          const viewerOrgPermission = viewerOrgPermissions.find((p) => p.orgId === orgUser.orgId)
          if (
            !viewerOrgPermission ||
            !(viewerOrgPermission.isOrgAdmin || viewerOrgPermission.isBillingLeader)
          ) {
            return false
          }

          // Check if org owns the user's email domain
          const organization = await dataLoader.get('organizations').loadNonNull(orgUser.orgId)
          const userDomain = getDomainFromEmail(userToDelete.email)
          return organization.activeDomain === userDomain
        })
      )

      if (hasOrgPermission.some(Boolean)) return true

      // Check team-level permissions
      const hasTeamPermission = teamMembers.some((userTeamMember) =>
        viewerTeamLeadPermissions.has(userTeamMember.teamId)
      )

      return hasTeamPermission
    })
  )

  const unauthorizedEmails = usersToDelete
    .filter((_, index) => !userPermissions[index])
    .map((user) => user.email)
  // If viewer doesn't have permission for ANY user and is not super user, return error
  if (!su && userPermissions.some((hasPermission) => !hasPermission)) {
    return {
      error: {
        message: `You don't have permission to remove the following users: ${unauthorizedEmails.join(', ')}`
      }
    }
  }

  const deletedEmails = []
  for (const userToDelete of usersToDelete) {
    const deletedUserEmail = await softDeleteUser(userToDelete.id, dataLoader)
    await markUserSoftDeleted(userToDelete.id, deletedUserEmail, 'Mass user deletion')
    deletedEmails.push(deletedUserEmail)
  }

  return {deletedEmails}
}

export default deleteUsers
