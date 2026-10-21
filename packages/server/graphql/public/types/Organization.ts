import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import runReport from '../../../reports/runReport'
import selectPopularReportQuestions from '../../../reports/selectPopularReportQuestions'
import {
  getUserId,
  isSuperUser,
  isUserBillingLeader,
  isUserOrgAdmin
} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import type {FeatureFlagName} from '../../../utils/featureFlags'
import {getStripeManager} from '../../../utils/stripe'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'
import type {OrganizationResolvers} from '../resolverTypes'

const MAX_ACTIVE_USER_COUNT_TIMES = 366

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
    return await dataLoader
      .get('featureFlagByOwnerId')
      .load({ownerId: orgId, featureName: featureName as FeatureFlagName})
  },
  tier: ({tier, trialStartDate}) => {
    return getFeatureTier({tier, trialStartDate})
  },
  billingTier: ({tier}) => tier,
  saml: async ({id: orgId}, _args, {dataLoader}) => {
    const samls = await dataLoader.get('samlsByOrgId').load(orgId)
    return samls[0] ?? null
  },
  samls: ({id: orgId}, _args, {dataLoader}) => {
    return dataLoader.get('samlsByOrgId').load(orgId)
  },

  isBillingLeader: async ({id: orgId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    return isUserBillingLeader(viewerId, orgId, dataLoader)
  },

  isOrgAdmin: async ({id: orgId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    return isUserOrgAdmin(viewerId, orgId, dataLoader)
  },

  activeTeamCount: async ({id: orgId}, _args, {dataLoader}) => {
    const activeTeams = await dataLoader.get('activeTeamsByOrgId').load(orgId)
    return activeTeams.length
  },

  activeUserCounts: async ({id: orgId}, {at}, {dataLoader}) => {
    if (at.length > MAX_ACTIVE_USER_COUNT_TIMES) {
      throw new GraphQLError(
        `Cannot count active users at more than ${MAX_ACTIVE_USER_COUNT_TIMES} times at once`
      )
    }
    return dataLoader.get('activeUserCountsByOrgId').load({orgId, times: at})
  },

  report: async ({id: orgId}, {spec, timeZone, pagePeriod}, {authToken, dataLoader}) => {
    const {breakdown = [], filters = [], where = [], ...rest} = spec
    return runReport({
      orgId,
      spec: {...rest, breakdown, filters, where},
      timeZone,
      pagePeriod: pagePeriod ?? null,
      viewerId: getUserId(authToken),
      isSuperUser: isSuperUser(authToken),
      dataLoader
    })
  },

  reportPins: async ({id: orgId}) => {
    const questions = await selectPopularReportQuestions()
    return questions
      .flatMap(({defaultPinSortOrder, ...question}) =>
        defaultPinSortOrder === null ? [] : [{...question, orgId, defaultPinSortOrder}]
      )
      .sort((a, b) => a.defaultPinSortOrder - b.defaultPinSortOrder)
  },

  popularReportQuestions: () => selectPopularReportQuestions(),

  recentReportQuestions: async ({id: orgId}, _args, {authToken}) => {
    return getKysely()
      .selectFrom('ReportQuestion')
      .selectAll()
      .where('userId', '=', getUserId(authToken))
      .where('orgId', '=', orgId)
      .orderBy('lastUsedAt', 'desc')
      .execute()
  },

  teams: async ({id: orgId}, _args, {dataLoader, authToken}) => {
    const viewerId = getUserId(authToken)
    const [teamsInOrg, isBillingLeader] = await Promise.all([
      dataLoader.get('teamsByOrgIds').load(orgId),
      isUserBillingLeader(viewerId, orgId, dataLoader)
    ])
    const sortedTeams = teamsInOrg.sort((a, b) => a.name.localeCompare(b.name))

    if (isBillingLeader || isSuperUser(authToken)) {
      // Billing leaders, org admins, and super users can see all teams
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
    const [organizationUsers, activeOrganizationUsers] = await Promise.all([
      dataLoader.get('organizationUsersByOrgId').load(orgId),
      dataLoader.get('activeOrganizationUsersByOrgId').load(orgId)
    ])
    return {
      inactiveUserCount: organizationUsers.length - activeOrganizationUsers.length,
      activeUserCount: activeOrganizationUsers.length
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
    const orgFeatureFlags = await dataLoader
      .get('allFeatureFlagsByOwner')
      .load({ownerId: orgId, scope: 'Organization'})
    return orgFeatureFlags.filter((flag) => flag.isPublic)
  },
  oauthApplications: async ({id: orgId}, _args, {dataLoader}) => {
    return dataLoader.get('oauthProvidersByOrgId').load(orgId)
  },
  oauthAPIProvider: async ({id: orgId}, {providerId}, {dataLoader}) => {
    const [dbProviderId] = CipherId.fromClient(providerId)
    const provider = await dataLoader.get('oAuthProviders').load(dbProviderId)

    if (!provider || provider.orgId !== orgId) {
      return null
    }

    return provider
  },

  coupon: async ({couponId}) => {
    if (!couponId) return null
    const manager = getStripeManager()
    const coupon = await manager.retrieveCoupon(couponId)
    if (coupon instanceof Error) return null
    return {
      percentOff: coupon.percent_off ?? 0,
      durationInMonths: coupon.duration_in_months ?? null
    }
  }
}

export default Organization
