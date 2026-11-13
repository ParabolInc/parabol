import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import type Stripe from 'stripe'
import removeTeamsLimitObjects from '../../../billing/helpers/removeTeamsLimitObjects'
import getKysely from '../../../postgres/getKysely'
import {toCreditCard} from '../../../postgres/helpers/toCreditCard'
import publish from '../../../utils/publish'
import {getStripeManager} from '../../../utils/stripe'
import toStripeGraphQLError from '../../../utils/stripe/toStripeGraphQLError'
import {stripeCardToDBCard} from '../../mutations/helpers/stripeCardToDBCard'
import type {MutationResolvers} from '../resolverTypes'

const updateCreditCard: MutationResolvers['updateCreditCard'] = async (
  _source,
  {orgId, paymentMethodId},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // RESOLUTION
  const organization = await dataLoader.get('organizations').loadNonNull(orgId)
  if (!organization) {
    throw new GraphQLError('Organization not found', {extensions: {code: 'NOT_FOUND'}})
  }

  const {stripeId, stripeSubscriptionId} = organization
  if (!stripeId || !stripeSubscriptionId) {
    throw new GraphQLError('Organization is not subscribed to a plan', {
      extensions: {code: 'CONFLICT'}
    })
  }
  const manager = getStripeManager()
  const subscription = await manager.retrieveSubscription(stripeSubscriptionId)
  if (subscription instanceof Error) throw toStripeGraphQLError(subscription)
  if (!subscription) {
    throw new GraphQLError('Organization is not subscribed to a plan', {
      extensions: {code: 'CONFLICT'}
    })
  }
  const customer = await manager.retrieveCustomer(stripeId)
  if (customer.deleted) {
    throw new GraphQLError('Stripe customer has been deleted', {extensions: {code: 'CONFLICT'}})
  }
  const {id: customerId} = customer
  const res = await manager.attachPaymentToCustomer(customerId, paymentMethodId)
  if (res instanceof Error) throw toStripeGraphQLError(res)
  await manager.updateDefaultPaymentMethod(customerId, paymentMethodId)
  await manager.updateSubscription(subscription.id, paymentMethodId)
  const stripeCard = await manager.retrieveCardDetails(paymentMethodId)
  if (stripeCard instanceof Error) throw toStripeGraphQLError(stripeCard)
  const creditCard = stripeCardToDBCard(stripeCard)

  await getKysely()
    .updateTable('Organization')
    .set({
      creditCard: toCreditCard(creditCard),
      isPaid: true,
      tier: 'team',
      stripeId: customer.id,
      tierLimitExceededAt: null,
      scheduledLockAt: null,
      lockedAt: null
    })
    .where('id', '=', orgId)
    .execute()
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
    throw new GraphQLError('Could not pay failed invoices', {extensions: {code: 'CONFLICT'}})
  }
  await removeTeamsLimitObjects(orgId, dataLoader)

  const teams = await dataLoader.get('teamsByOrgIds').load(orgId)
  const teamIds = teams.map(({id}) => id)
  const latestInvoice = subscription.latest_invoice as Stripe.Invoice
  const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent
  const stripeSubscriptionClientSecret = paymentIntent.client_secret
  const data = {teamIds, orgId}

  teamIds.forEach((teamId) => {
    publish(SubscriptionChannel.TEAM, teamId, 'UpdateCreditCardPayload', data, subOptions)
  })

  return {
    ...data,
    stripeSubscriptionClientSecret
  }
}

export default updateCreditCard
