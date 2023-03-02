import {isNotNull} from 'parabol-client/utils/predicates'
import {Threshold} from '../../../../client/types/constEnums'
import fetchAllLines from '../../../billing/helpers/fetchAllLines'
import generateInvoice from '../../../billing/helpers/generateInvoice'
import generateUpcomingInvoice from '../../../billing/helpers/generateUpcomingInvoice'
import getRethink from '../../../database/rethinkDriver'
import {getUserId, isSuperUser, isUserBillingLeader} from '../../../utils/authorization'
import getDomainFromEmail from '../../../utils/getDomainFromEmail'
import isCompanyDomain from '../../../utils/isCompanyDomain'
import standardError from '../../../utils/standardError'
import {getStripeManager} from '../../../utils/stripe'
import {UserResolvers} from '../resolverTypes'
import {MeetingTypeEnum} from '../../../postgres/types/Meeting'
import getScoredTemplates from '../../queries/helpers/getScoredTemplates'
import isValid from '../../isValid'
import MeetingTemplate from '../../../database/types/MeetingTemplate'
import db from '../../../db'
import connectionFromTemplateArray from '../../queries/helpers/connectionFromTemplateArray'

const User: UserResolvers = {
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
    const user = (await dataLoader.get('users').load(userId))!
    const teamIds =
      viewerId === userId || isSuperUser(authToken)
        ? user.tms
        : user.tms.filter((teamId: string) => authToken.tms.includes(teamId))

    // Get the team templates.
    const teamTemplates = await dataLoader
      .get('meetingTemplatesByType')
      .loadMany([
        ...teamIds.map((teamId) => ({teamId, meetingType: 'poker' as MeetingTypeEnum})),
        ...teamIds.map((teamId) => ({teamId, meetingType: 'retrospective' as MeetingTypeEnum}))
      ])
    const scoredTeamTemplates = await getScoredTemplates(teamTemplates.filter(isValid).flat(), 0.9)

    // Get the org templates.
    const teams = await dataLoader.get('teams').loadMany(teamIds)
    const orgIds = [...new Set(teams.filter(isValid).map((team) => team.orgId))]
    const orgTemplatesResult = await dataLoader.get('meetingTemplatesByOrgId').loadMany(orgIds)
    const organizationTemplates = orgTemplatesResult
      .filter(isValid)
      .flat()
      .filter(
        (template: MeetingTemplate) =>
          template.scope !== 'TEAM' && !teamIds.includes(template.teamId)
      )
    const scoredOrgTemplates = await getScoredTemplates(organizationTemplates, 0.8)

    // Get the public templates.
    const publicRetroTemplates = await db.read('publicTemplates', 'retrospective')
    const publicPokerTemplates = await db.read('publicTemplates', 'poker')
    const publicTemplates = [...publicRetroTemplates, ...publicPokerTemplates]
    publicTemplates.sort((a, b) => {
      if (a.isFree && !b.isFree) return -1
      if (!a.isFree && b.isFree) return 1
      return 0
    })

    const templates = [...scoredTeamTemplates, ...scoredOrgTemplates, ...publicTemplates]

    return connectionFromTemplateArray(templates, first, after)
  }
}

export default User
