import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import getRethink from '../database/rethinkDriver'
import AuthToken from '../database/types/AuthToken'
import OrganizationUser from '../database/types/OrganizationUser'
import {DataLoaderWorker} from '../graphql/graphql'

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

// export const isPastOrPresentTeamMember = async (viewerId: string, teamId: string) => {
//   const r = await getRethink()
//   return r
//     .table('TeamMember')
//     .getAll(teamId, {index: 'teamId'})
//     .filter({userId: viewerId})
//     .count()
//     .ge(1)
//     .run()
// }

export const isTeamLead = async (userId: string, teamId: string) => {
  const r = await getRethink()
  const teamMemberId = toTeamMemberId(teamId, userId)
  return r.table('TeamMember').get(teamMemberId)('isLead').default(false).run()
}

interface Options {
  clearCache?: boolean
}
export const isUserBillingLeader = async (
  userId: string,
  orgId: string,
  dataLoader: DataLoaderWorker,
  options?: Options
) => {
  const organizationUser = await dataLoader
    .get('organizationUsersByUserIdOrgId')
    .load({userId, orgId})
  if (options && options.clearCache) {
    dataLoader.get('organizationUsersByUserId').clear(userId)
  }
  return organizationUser ? organizationUser.role === 'BILLING_LEADER' : false
}

export const isUserInOrg = async (userId: string, orgId: string) => {
  const r = await getRethink()
  const organizationUser = await r
    .table('OrganizationUser')
    .getAll(userId, {index: 'userId'})
    .filter({orgId})
    .filter({removedAt: null})
    .nth(0)
    .run()
  return !!organizationUser
}

export const isOrgLeaderOfUser = async (authToken: AuthToken, userId: string) => {
  const r = await getRethink()
  const viewerId = getUserId(authToken)
  const {viewerOrgIds, userOrgIds} = await r({
    viewerOrgIds: r
      .table('OrganizationUser')
      .getAll(viewerId, {index: 'userId'})
      .filter({removedAt: null, role: 'BILLING_LEADER'})('orgId')
      .coerceTo('array') as any as OrganizationUser[],
    userOrgIds: r
      .table('OrganizationUser')
      .getAll(userId, {index: 'userId'})
      .filter({removedAt: null})('orgId')
      .coerceTo('array') as any as OrganizationUser[]
  }).run()
  const uniques = new Set(viewerOrgIds.concat(userOrgIds))
  const total = viewerOrgIds.length + userOrgIds.length
  return uniques.size < total
}
