import {IAuthToken} from 'universal/types/graphql'
import {BILLING_LEADER, PERSONAL} from 'universal/utils/constants'
import getRethink from '../database/rethinkDriver'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'

export const getUserId = (authToken: any) => {
  return authToken && typeof authToken === 'object' ? (authToken.sub as string) : ''
}

export const isAuthenticated = (authToken) => Boolean(authToken)

export const isSuperUser = (authToken) => {
  const userId = getUserId(authToken)
  return userId ? authToken.rol === 'su' : false
}

export const isTeamMember = (authToken: IAuthToken, teamId: string) => {
  const {tms} = authToken
  return Array.isArray(tms) && tms.includes(teamId)
}

export const isPastOrPresentTeamMember = async (viewerId, teamId) => {
  const r = getRethink()
  return r
    .table('TeamMember')
    .getAll(teamId, {index: 'teamId'})
    .filter({userId: viewerId})
    .count()
    .ge(1)
}

export const isTeamLead = async (userId, teamId) => {
  const r = getRethink()
  const teamMemberId = toTeamMemberId(teamId, userId)
  return r
    .table('TeamMember')
    .get(teamMemberId)('isLead')
    .default(false)
    .run()
}

export const requireSU = (authToken) => {
  if (!isSuperUser(authToken)) {
    throw new Error('Unauthorized. Must be a super user to run this query.')
  }
}

interface Options {
  clearCache?: boolean
}
export const isUserBillingLeader = async (
  userId: string,
  orgId: string,
  dataLoader: any,
  options?: Options
) => {
  const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
  const organizationUser = organizationUsers.find(
    (organizationUser) => organizationUser.orgId === orgId
  )
  if (options && options.clearCache) {
    dataLoader.get('organizationUsersByUserId').clear(userId)
  }
  return organizationUser ? organizationUser.role === BILLING_LEADER : false
}

export const isUserInOrg = async (userId, orgId) => {
  const r = getRethink()
  const organizationUser = await r
    .table('OrganizationUser')
    .getAll(userId, {index: 'userId'})
    .filter({orgId})
    .filter({removedAt: null})
    .nth(0)
  return !!organizationUser
}

export const isOrgLeaderOfUser = async (authToken, userId) => {
  const r = getRethink()
  const viewerId = getUserId(authToken)
  const {viewerOrgIds, userOrgIds} = await r({
    viewerOrgIds: r
      .table('OrganizationUser')
      .getAll(viewerId, {index: 'userId'})
      .filter({removedAt: null, role: BILLING_LEADER})('orgId')
      .coerceTo('array'),
    userOrgIds: r
      .table('OrganizationUser')
      .getAll(userId, {index: 'userId'})
      .filter({removedAt: null})('orgId')
      .coerceTo('array')
  })
  const uniques = new Set(viewerOrgIds.concat(userOrgIds))
  const total = viewerOrgIds.length + userOrgIds.length
  return uniques.size < total
}

export const isPaidTier = async (teamId) => {
  const r = getRethink()
  const tier = await r.table('Team').get(teamId)('tier')
  return tier !== PERSONAL
}
