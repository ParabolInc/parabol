import {getUsersByEmails} from '../../../postgres/queries/getUsersByEmails'
import {getUserById} from '../../../postgres/queries/getUsersByIds'
import {
  getUserId,
  isSuperUser,
  isUserBillingLeader,
  isUserOrgAdmin
} from '../../../utils/authorization'
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
    return {error: {message: 'Provide emails'}}
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

      const userOrgUsers = await dataLoader.get('organizationUsersByUserId').load(userToDelete.id)
      const userTeamMembers = await dataLoader.get('teamMembersByUserId').load(userToDelete.id)

      // Check org-level permissions
      const hasOrgPermission = userOrgUsers.some((userOrgUser) => {
        const viewerOrgPermission = viewerOrgPermissions.find((p) => p.orgId === userOrgUser.orgId)
        return (
          viewerOrgPermission &&
          (viewerOrgPermission.isOrgAdmin || viewerOrgPermission.isBillingLeader)
        )
      })

      if (hasOrgPermission) return true

      // Check team-level permissions
      const hasTeamPermission = userTeamMembers.some((userTeamMember) =>
        viewerTeamLeadPermissions.has(userTeamMember.teamId)
      )

      return hasTeamPermission
    })
  )

  // If viewer doesn't have permission for ANY user and is not super user, return error
  if (!su && userPermissions.some((hasPermission) => !hasPermission)) {
    return {
      error: {
        message: 'You must have permission to remove all specified users'
      }
    }
  }

  for (const userToDelete of usersToDelete) {
    const deletedUserEmail = await softDeleteUser(userToDelete.id, dataLoader)
    await markUserSoftDeleted(userToDelete.id, deletedUserEmail, 'Mass user deletion')
  }

  return {success: true}
}

export default deleteUsers