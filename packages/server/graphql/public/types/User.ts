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

const User: UserResolvers = {
  company: async ({email}, _args, {authToken}) => {
    const domain = getDomainFromEmail(email)
    if (!domain || !isCompanyDomain(domain) || !isSuperUser(authToken)) return null
    return {id: domain}
  },
  domains: async ({id: userId}, _args, {dataLoader}) => {
    const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
    const orgIds = organizationUsers
      .filter(({suggestedTier}) => suggestedTier && suggestedTier !== 'starter')
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
  }
}

export default User
