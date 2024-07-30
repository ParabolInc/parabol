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

export const isTeamMember = (authToken: AuthToken, teamId: string) => {
  const {tms} = authToken
  return Array.isArray(tms) && tms.includes(teamId)
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
