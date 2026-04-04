import type Stripe from 'stripe'
import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import {getStripeManager} from '../../../utils/stripe'
import type {MutationResolvers} from '../resolverTypes'

const createStripeSubscription: MutationResolvers['createStripeSubscription'] = async (
  _source,
  {orgId, paymentMethodId},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)

  const [viewer, organization, activeOrgUsers] = await Promise.all([
    dataLoader.get('users').loadNonNull(viewerId),
    dataLoader.get('organizations').loadNonNull(orgId),
    dataLoader.get('activeOrganizationUsersByOrgId').load(orgId)
  ])
  const orgUsersCount = activeOrgUsers.length
  const manager = getStripeManager()
  const {stripeId, stripeSubscriptionId} = organization
  if (stripeSubscriptionId) {
    return standardError(new Error('Organization already has a subscription'), {userId: viewerId})
  }
  const {email} = viewer
  let customer: Stripe.Response<Stripe.Customer | Stripe.DeletedCustomer>
  if (stripeId) {
    customer = await manager.retrieveCustomer(stripeId)
    const {id: customerId} = customer
    const res = await manager.attachPaymentToCustomer(customerId, paymentMethodId)
    if (res instanceof Error) return standardError(res, {userId: viewerId})
    // cannot updateDefaultPaymentMethod until it is attached to the customer
    await manager.updateDefaultPaymentMethod(customerId, paymentMethodId)
  } else {
    const maybeCustomer = await manager.createCustomer(orgId, email, paymentMethodId)
    if (maybeCustomer instanceof Error) return {error: {message: maybeCustomer.message}}
    customer = maybeCustomer
  }

  const {couponId} = organization
  const subscription = await manager.createTeamSubscription(
    customer.id,
    orgUsersCount,
    {orgId, userId: viewerId},
    couponId ?? undefined
  )

  // Clear the coupon from the org now that it has been applied to the Stripe subscription.
  // Do this regardless of whether payment confirmation succeeds — the coupon is already
  // committed to the subscription in Stripe.
  if (couponId) {
    const pg = getKysely()
    await pg.updateTable('Organization').set({couponId: null}).where('id', '=', orgId).execute()
  }

  const latestInvoice = subscription.latest_invoice as Stripe.Invoice
  const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent
  const clientSecret = paymentIntent.client_secret!

  analytics.organizationUpgradeAttempted(viewer, orgId)
  const data = {stripeSubscriptionClientSecret: clientSecret}
  return data
}

export default createStripeSubscription
