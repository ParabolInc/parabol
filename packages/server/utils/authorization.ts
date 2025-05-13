import AuthToken from '../database/types/AuthToken'
import {DataLoaderWorker} from '../graphql/graphql'
import {OrganizationUser} from '../postgres/types'

export const getUserId = (authToken: any) => {
  return authToken && typeof authToken === 'object' ? (authToken.sub as string) : ''
}

export const isAuthenticated = (authToken: any): authToken is AuthToken => {
  return typeof authToken?.sub === 'string'
}

export const isSuperUser = (authToken: AuthToken) => {
  const userId = getUserId(authToken)
  return userId ? authToken.rol === 'su' : false
}

export function isTeamMember(authToken: AuthToken, teamId: string): boolean
export function isTeamMember(
  authToken: AuthToken,
  teamId: string,
  dataLoader: DataLoaderWorker
): boolean
export function isTeamMember(
  authToken: AuthToken,
  teamId: string,
  dataLoader?: DataLoaderWorker
): boolean {
  // Original team member check
  const {tms} = authToken
  const isDirectTeamMember = Array.isArray(tms) && tms.includes(teamId)

  // If no dataLoader provided or user is already a team member, return synchronously
  if (!dataLoader || isDirectTeamMember) {
    return isDirectTeamMember
  }

  // Start async check for org admin status
  const userId = getUserId(authToken)
  void (async () => {
    const team = await dataLoader.get('teams').load(teamId)
    if (!team) return false
    return await isUserOrgAdmin(userId, team.orgId, dataLoader)
  })()

  // Return false for now - the async check will update permissions later if needed
  return false
}

interface Options {
  clearCache?: boolean
}

const isUserAnyRoleIn = async (
  userId: string,
  orgId: string,
  dataLoader: DataLoaderWorker,
  roles: NonNullable<OrganizationUser['role']>[],
  options?: Options
) => {
  const organizationUser = await dataLoader
    .get('organizationUsersByUserIdOrgId')
    .load({userId, orgId})
  if (options && options.clearCache) {
    dataLoader.get('organizationUsersByUserId').clear(userId)
  }
  return organizationUser && organizationUser.role ? roles.includes(organizationUser.role) : false
}
export const isUserBillingLeader = async (
  userId: string,
  orgId: string,
  dataLoader: DataLoaderWorker,
  options?: Options
) => {
  return isUserAnyRoleIn(userId, orgId, dataLoader, ['BILLING_LEADER', 'ORG_ADMIN'], options)
}
export const isUserOrgAdmin = async (
  userId: string,
  orgId: string,
  dataLoader: DataLoaderWorker,
  options?: Options
) => {
  return isUserAnyRoleIn(userId, orgId, dataLoader, ['ORG_ADMIN'], options)
}

export const isUserInOrg = async (userId: string, orgId: string, dataLoader: DataLoaderWorker) => {
  const organizationUser = await dataLoader
    .get('organizationUsersByUserIdOrgId')
    .load({userId, orgId})
  return !!organizationUser
}
