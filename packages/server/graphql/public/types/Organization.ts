import {
  getUserId,
  isSuperUser,
  isUserBillingLeader,
  isUserOrgAdmin
} from '../../../utils/authorization'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'
import {OrganizationResolvers} from '../resolverTypes'
import getActiveTeamCountByOrgIds from './helpers/getActiveTeamCountByOrgIds'

const Organization: OrganizationResolvers = {
  approvedDomains: async ({id: orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizationApprovedDomainsByOrgId').load(orgId)
  },
  meetingStats: async ({id: orgId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingStatsByOrgId').load(orgId)
  },
  teamStats: async ({id: orgId}, _args, {dataLoader}) => {
    return dataLoader.get('teamStatsByOrgId').load(orgId)
  },
  company: async ({activeDomain}, _args, {authToken}) => {
    if (!activeDomain || !isSuperUser(authToken)) return null
    return {id: activeDomain}
  },
  featureFlag: async ({id: orgId}, {featureName}, {dataLoader}) => {
    return await dataLoader.get('featureFlagByOwnerId').load({ownerId: orgId, featureName})
  },
  picture: async ({picture}, _args, {dataLoader}) => {
    if (!picture) return null
    return dataLoader.get('fileStoreAsset').load(picture)
  },
  tier: ({tier, trialStartDate}) => {
    return getFeatureTier({tier, trialStartDate})
  },
  billingTier: ({tier}) => tier,
  saml: async ({id: orgId}, _args, {dataLoader}) => {
    const saml = await dataLoader.get('samlByOrgId').load(orgId)
    return saml || null
  },

  isBillingLeader: async ({id: orgId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    return isUserBillingLeader(viewerId, orgId, dataLoader)
  },

  isOrgAdmin: async ({id: orgId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    return isUserOrgAdmin(viewerId, orgId, dataLoader)
  },

  activeTeamCount: async ({id: orgId}) => {
    return getActiveTeamCountByOrgIds(orgId)
  },

  teams: async ({id: orgId}, _args, {dataLoader, authToken}) => {
    const viewerId = getUserId(authToken)
    const [teamsInOrg, isOrgAdmin] = await Promise.all([
      dataLoader.get('teamsByOrgIds').load(orgId),
      isUserOrgAdmin(viewerId, orgId, dataLoader)
    ])
    const sortedTeams = teamsInOrg.sort((a, b) => a.name.localeCompare(b.name))

    if (isOrgAdmin || isSuperUser(authToken)) {
      // Org admins and super users can see all teams
      return sortedTeams
    } else {
      // Regular users can see teams they're on plus public teams
      return sortedTeams.filter((team) => team.isPublic || authToken.tms.includes(team.id))
    }
  },

  allTeamsCount: async ({id: orgId}, _args, {dataLoader}) => {
    const allTeamsOnOrg = await dataLoader.get('teamsByOrgIds').load(orgId)
    return allTeamsOnOrg?.length ?? 0
  },

  viewerOrganizationUser: async ({id: orgId}, _args, {dataLoader, authToken}) => {
    const viewerId = getUserId(authToken)
    return dataLoader.get('organizationUsersByUserIdOrgId').load({userId: viewerId, orgId})
  },

  organizationUsers: async ({id: orgId}, _args, {dataLoader}) => {
    const organizationUsers = await dataLoader.get('organizationUsersByOrgId').load(orgId)
    organizationUsers.sort((a, b) => (a.orgId > b.orgId ? 1 : -1))
    const edges = organizationUsers.map((node) => ({
      cursor: node.id,
      node
    }))
    // TODO implement pagination
    const firstEdge = edges[0]
    return {
      edges,
      pageInfo: {
        endCursor: firstEdge ? edges[edges.length - 1]!.cursor : null,
        hasNextPage: false,
        hasPreviousPage: false
      }
    }
  },

  orgUserCount: async ({id: orgId}, _args, {dataLoader}) => {
    const organizationUsers = await dataLoader.get('organizationUsersByOrgId').load(orgId)
    const inactiveUserCount = organizationUsers.filter(({inactive}) => inactive).length
    return {
      inactiveUserCount,
      activeUserCount: organizationUsers.length - inactiveUserCount
    }
  },

  billingLeaders: async ({id: orgId}, _args, {dataLoader}) => {
    const organizationUsers = await dataLoader.get('organizationUsersByOrgId').load(orgId)
    return organizationUsers.filter(
      (organizationUser) =>
        organizationUser.role === 'BILLING_LEADER' || organizationUser.role === 'ORG_ADMIN'
    )
  },
  integrationProviders: ({id: orgId}) => ({orgId}),
  orgFeatureFlags: async ({id: orgId}, _args, {dataLoader}) => {
    return dataLoader.get('allFeatureFlagsByOwner').load({ownerId: orgId, scope: 'Organization'})
  }
}

export default Organization
