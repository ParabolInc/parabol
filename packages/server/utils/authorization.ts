import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import getRethink from '../database/rethinkDriver'
import AuthToken from '../database/types/AuthToken'
import OrganizationUser from '../database/types/OrganizationUser'
import {DataLoaderWorker} from '../graphql/graphql'
import {RDatum} from '../database/stricterR'
import {OrgUserRole} from '../database/types/OrganizationUser'

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

export const isTeamLead = async (userId: string, teamId: string, dataLoader: DataLoaderWorker) => {
  const r = await getRethink()
  const teamMemberId = toTeamMemberId(teamId, userId)
  if (await r.table('TeamMember').get(teamMemberId)('isLead').default(false).run()) {
    return true
  }

  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const organizationUser = await dataLoader
    .get('organizationUsersByUserIdOrgId')
    .load({userId, orgId: team.orgId})
  return organizationUser?.role === 'ORG_ADMIN'
}

interface Options {
  clearCache?: boolean
}

const isUserAnyRoleIn = async (
  userId: string,
  orgId: string,
  dataLoader: DataLoaderWorker,
  roles: OrgUserRole[],
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

export const isOrgLeaderOfUser = async (authToken: AuthToken, userId: string) => {
  const r = await getRethink()
  const viewerId = getUserId(authToken)
  const {viewerOrgIds, userOrgIds} = await r({
    viewerOrgIds: r
      .table('OrganizationUser')
      .getAll(viewerId, {index: 'userId'})
      .filter({removedAt: null})
      .filter((row: RDatum) => r.expr(['BILLING_LEADER', 'ORG_ADMIN']).contains(row('role')))(
        'orgId'
      )
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
