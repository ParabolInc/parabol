import ms from 'ms'
import DomainJoinRequestId from 'parabol-client/shared/gqlIds/DomainJoinRequestId'
import {isNotNull} from 'parabol-client/utils/predicates'
import {Threshold} from '../../../../client/types/constEnums'
import fetchAllLines from '../../../billing/helpers/fetchAllLines'
import generateInvoice from '../../../billing/helpers/generateInvoice'
import generateUpcomingInvoice from '../../../billing/helpers/generateUpcomingInvoice'
import getRethink from '../../../database/rethinkDriver'
import MeetingTemplate from '../../../database/types/MeetingTemplate'
import {
  getUserId,
  isSuperUser,
  isTeamMember,
  isUserBillingLeader
} from '../../../utils/authorization'
import getDomainFromEmail from '../../../utils/getDomainFromEmail'
import isCompanyDomain from '../../../utils/isCompanyDomain'
import standardError from '../../../utils/standardError'
import {getStripeManager} from '../../../utils/stripe'
import connectionFromTemplateArray from '../../queries/helpers/connectionFromTemplateArray'
import {UserResolvers} from '../resolverTypes'

declare const __PRODUCTION__: string

const User: UserResolvers = {
  activity: async (_source, {activityId}, {dataLoader}) => {
    const activity = await dataLoader.get('meetingTemplates').load(activityId)
    return activity || null
  },
  canAccess: async (_source, {entity, id}, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    switch (entity) {
      case 'Team':
        return isTeamMember(authToken, id)
      case 'Meeting':
        const meeting = await dataLoader.get('newMeetings').load(id)
        if (!meeting) {
          return false
        }
        const {teamId} = meeting
        return isTeamMember(authToken, teamId)
      case 'Organization':
        const organizationUser = await dataLoader
          .get('organizationUsersByUserIdOrgId')
          .load({userId: viewerId, id})
        return !!organizationUser
      default:
        return false
    }
  },
  company: async ({email}, _args, {authToken}) => {
    const domain = getDomainFromEmail(email)
    if (!domain || !isCompanyDomain(domain) || !isSuperUser(authToken)) return null
    return {id: domain}
  },
  domains: async ({id: userId}, _args, {dataLoader}) => {
    const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
    const orgIds = organizationUsers
      .filter(({suggestedTier}) => suggestedTier)
      .map(({orgId}) => orgId)

    const organizations = await Promise.all(
      orgIds.map((orgId) => dataLoader.get('organizations').load(orgId))
    )
    const approvedDomains = organizations.map(({activeDomain}) => activeDomain).filter(isNotNull)
    return [...new Set(approvedDomains)].map((id) => ({id}))
  },
  domainJoinRequest: async ({email}, {requestId}, {dataLoader}) => {
    const request = await dataLoader
      .get('domainJoinRequests')
      .loadNonNull(DomainJoinRequestId.split(requestId))
    const domain = getDomainFromEmail(email)
    if (domain !== request.domain) {
      return null
    }
    return request
  },
  featureFlags: ({featureFlags}) => {
    return Object.fromEntries(featureFlags.map((flag) => [flag as any, true]))
  },
  invoiceDetails: async (_source, {invoiceId}, {authToken, dataLoader}) => {
    const r = await getRethink()
    const now = new Date()

    const viewerId = getUserId(authToken)
    const isUpcoming = invoiceId.startsWith('upcoming_')
    const currentInvoice = await r.table('Invoice').get(invoiceId).default(null).run()
    const orgId = (currentInvoice && currentInvoice.orgId) || invoiceId.substring(9) // remove 'upcoming_'
    if (!(await isUserBillingLeader(viewerId, orgId, dataLoader))) {
      standardError(new Error('Not organization lead'), {userId: viewerId})
      return null
    }
    if (currentInvoice) {
      const invalidAt = new Date(
        currentInvoice.createdAt.getTime() + Threshold.UPCOMING_INVOICE_TIME_VALID
      )
      if (invalidAt > now) return currentInvoice
    }
    if (isUpcoming) {
      return generateUpcomingInvoice(orgId, dataLoader)
    }
    const manager = getStripeManager()
    const stripeLineItems = await fetchAllLines(invoiceId)
    const invoice = await manager.retrieveInvoice(invoiceId)
    return generateInvoice(invoice, stripeLineItems, orgId, invoiceId, dataLoader)
  },
  availableTemplates: async ({id: userId}, {first, after}, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const user = await dataLoader.get('users').loadNonNull(userId)
    const teamIds =
      viewerId === userId || isSuperUser(authToken)
        ? user.tms
        : user.tms.filter((teamId: string) => authToken.tms.includes(teamId))

    const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(viewerId)
    const userOrgIds = organizationUsers.map(({id}) => id)
    const availableOrgIds = ['aGhostOrg', ...userOrgIds]
    const [parabolActivities, ...userActivities] = await Promise.all(
      availableOrgIds.map((orgId) => dataLoader.get('meetingTemplatesByOrgId').load(orgId))
    )
    const allUserActivities = userActivities.flat()
    if (!__PRODUCTION__) {
      if (parabolActivities.length + allUserActivities.length > first) {
        throw new Error(
          'Please implement pagination for User.activities or increase `first` for the query'
        )
      }
    }
    const getScore = (activity: MeetingTemplate, teamIds: string[]) => {
      const SEASONAL = 1 << 8 // put seasonal templates at the top
      const USED_LAST_90 = 1 << 7 // next, show all templates used within the last 90 days
      const ON_TEAM = 1 << 6 // tiebreak by putting team templates first
      const ON_ORG = 1 << 5 // then org templates
      const IS_FREE = 1 << 4 // then free parabol templates
      const USED_LAST_30 = 1 << 3 // tiebreak on being used in last 30
      const {hideStartingAt, teamId, orgId, lastUsedAt, isFree} = activity
      const isSeasonal = !!hideStartingAt
      const isOnTeam = teamIds.includes(teamId)
      const isOnOrg = orgId !== 'aGhostOrg' && !isOnTeam
      const isUsedLast30 = lastUsedAt && lastUsedAt > new Date(Date.now() - ms('30d'))
      const isUsedLast90 = lastUsedAt && lastUsedAt > new Date(Date.now() - ms('90d'))
      let score = 0
      if (isSeasonal) score += SEASONAL
      if (isUsedLast90) score += USED_LAST_90
      if (isOnTeam) score += ON_TEAM
      if (isOnOrg) score += ON_ORG
      if (isFree) score += IS_FREE
      if (isUsedLast30) score += USED_LAST_30

      return score
    }
    const allActivities = [...parabolActivities, ...allUserActivities]
      .map((activity) => ({
        ...activity,
        sortOrder: getScore(activity, teamIds)
      }))
      .sort((a, b) => (a.sortOrder > b.sortOrder ? -1 : 1))

    return connectionFromTemplateArray(allActivities, first, after)
  }
}

export default User
