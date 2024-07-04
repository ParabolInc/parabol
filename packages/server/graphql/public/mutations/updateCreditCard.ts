import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import Stripe from 'stripe'
import removeTeamsLimitObjects from '../../../billing/helpers/removeTeamsLimitObjects'
import getKysely from '../../../postgres/getKysely'
import {toCreditCard} from '../../../postgres/helpers/toCreditCard'
import updateTeamByOrgId from '../../../postgres/queries/updateTeamByOrgId'
import {getUserId, isUserBillingLeader} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import setTierForOrgUsers from '../../../utils/setTierForOrgUsers'
import setUserTierForOrgId from '../../../utils/setUserTierForOrgId'
import standardError from '../../../utils/standardError'
import {getStripeManager} from '../../../utils/stripe'
import {stripeCardToDBCard} from '../../mutations/helpers/stripeCardToDBCard'
import {MutationResolvers} from '../resolverTypes'

const updateCreditCard: MutationResolvers['updateCreditCard'] = async (
  _source,
  {orgId, paymentMethodId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const viewerId = getUserId(authToken)
  if (!(await isUserBillingLeader(viewerId, orgId, dataLoader))) {
    return standardError(new Error('Must be the organization leader'), {userId: viewerId})
  }

  // RESOLUTION
  const organization = await dataLoader.get('organizations').loadNonNull(orgId)
  if (!organization) return {error: {message: 'Organization not found'}}

  const {stripeId, stripeSubscriptionId} = organization
  if (!stripeId || !stripeSubscriptionId) {
    return standardError(new Error('Organization is not subscribed to a plan'), {userId: viewerId})
  }
  const manager = getStripeManager()
  const subscription = await manager.retrieveSubscription(stripeSubscriptionId)
  if (subscription instanceof Error) return standardError(subscription, {userId: viewerId})
  if (!subscription) {
    return standardError(new Error('Organization is not subscribed to a plan'), {
      userId: viewerId
    })
  }
  const customer = await manager.retrieveCustomer(stripeId)
  if (customer.deleted) {
    return standardError(new Error('Stripe customer has been deleted'), {userId: viewerId})
  }
  const {id: customerId} = customer
  const res = await manager.attachPaymentToCustomer(customerId, paymentMethodId)
  if (res instanceof Error) return standardError(res, {userId: viewerId})
  await manager.updateDefaultPaymentMethod(customerId, paymentMethodId)
  await manager.updateSubscription(subscription.id, paymentMethodId)
  const stripeCard = await manager.retrieveCardDetails(paymentMethodId)
  if (stripeCard instanceof Error) return standardError(stripeCard, {userId: viewerId})
  const creditCard = stripeCardToDBCard(stripeCard)

  await Promise.all([
    getKysely()
      .updateTable('Organization')
      .set({
        creditCard: toCreditCard(creditCard),
        tier: 'team',
        stripeId: customer.id,
        tierLimitExceededAt: null,
        scheduledLockAt: null,
        lockedAt: null
      })
      .where('id', '=', orgId)
      .execute(),
    updateTeamByOrgId(
      {
        isPaid: true,
        tier: 'team'
      },
      orgId
    )
  ])
  dataLoader.get('organizations').clear(orgId)

  // If there are unpaid open invoices, try to process them
  const openInvoices = (await manager.listSubscriptionOpenInvoices(stripeSubscriptionId)).data

  let unpaidInvoice = false
  if (openInvoices.length) {
    for (const invoice of openInvoices) {
      const invoiceResult = await manager.payInvoice(invoice.id)
      // Unlock teams only if all invoices are paid
      if (invoiceResult.status !== 'paid') {
        unpaidInvoice = true
      }
    }
  }
  if (unpaidInvoice) {
    return standardError(new Error('Could not pay failed invoices'), {userId: viewerId})
  }
  await Promise.all([
    removeTeamsLimitObjects(orgId, dataLoader),
    setUserTierForOrgId(orgId),
    setTierForOrgUsers(orgId)
  ])

  const teams = await dataLoader.get('teamsByOrgIds').load(orgId)
  const teamIds = teams.map(({id}) => id)
  const latestInvoice = subscription.latest_invoice as Stripe.Invoice
  const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent
  const stripeSubscriptionClientSecret = paymentIntent.client_secret
  const data = {teamIds, orgId}

  teamIds.forEach((teamId) => {
    publish(SubscriptionChannel.TEAM, teamId, 'UpdateCreditCardPayload', data, subOptions)
  })

  publish(SubscriptionChannel.ORGANIZATION, orgId, 'UpdateCreditCardPayload', data, subOptions)

  return {
    ...data,
    stripeSubscriptionClientSecret
  }
}

export default updateCreditCard
