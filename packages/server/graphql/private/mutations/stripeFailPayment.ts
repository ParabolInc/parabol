import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import Stripe from 'stripe'
import terminateSubscription from '../../../billing/helpers/terminateSubscription'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {isSuperUser} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import {getStripeManager} from '../../../utils/stripe'
import {MutationResolvers} from '../resolverTypes'

export type StripeFailPaymentPayloadSource =
  | {
      orgId: string
      notificationId?: string
    }
  | {error: {message: string}}

const stripeFailPayment: MutationResolvers['stripeFailPayment'] = async (
  _source,
  {invoiceId},
  {authToken, dataLoader}
) => {
  // AUTH
  if (!isSuperUser(authToken)) {
    throw new Error('Don’t be rude.')
  }

  const pg = getKysely()
  const manager = getStripeManager()

  // VALIDATION
  const invoice = await manager.retrieveInvoice(invoiceId)
  const {customer: invoiceCustomer, metadata, subscription, paid} = invoice
  const customerId = invoiceCustomer as string
  let maybeOrgId = metadata?.orgId
  const customer = await manager.retrieveCustomer(customerId)
  if (!maybeOrgId) {
    if ('metadata' in customer) {
      maybeOrgId = customer.metadata.orgId
    }
  }
  if (!maybeOrgId) {
    return {error: {message: `Could not find orgId on invoice ${invoiceId}`}}
  }
  if (customer.deleted === true) {
    return {error: {message: 'Customer has been deleted'}}
  }
  // TS Error doesn't know if orgId stays a string or not
  const orgId = maybeOrgId
  const org = await dataLoader.get('organizations').load(orgId)

  if (!org) {
    // org no longer exists, can fail silently (useful for all the staging server bugs)
    return {error: {message: 'Org does not exist'}}
  }

  const {stripeSubscriptionId} = org
  const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent
  if (paymentIntent && paymentIntent.status === 'requires_action') {
    // The payment failed because it requires 3D Secure
    // Don't cancel the subscription. Wait for the client to authenticate
    return {error: {message: 'Required 3D Secure auth'}, orgId}
  }

  if (paid || stripeSubscriptionId !== subscription || !stripeSubscriptionId) {
    return {orgId}
  }

  // RESOLUTION
  const subscriptionObject = await manager.retrieveSubscription(stripeSubscriptionId)

  if (subscriptionObject.status === 'incomplete' || subscriptionObject.status === 'canceled') {
    // Terminate subscription if the first payment fails or if it is already canceled
    // After 23 hours subscription updates to incomplete_expired and the invoice becomes void.
    // Not to handle this particular case in 23 hours, we do it now
    await terminateSubscription(orgId)
  }
  const orgUsers = await dataLoader.get('organizationUsersByOrgId').load(orgId)
  const billingLeaderOrgUsers = orgUsers.filter(
    ({role}) => role && ['BILLING_LEADER', 'ORG_ADMIN'].includes(role)
  )
  const billingLeaderUserIds = billingLeaderOrgUsers.map(({userId}) => userId)

  const {default_source} = customer

  const creditCardRes = default_source
    ? await manager.retrieveCardDetails(default_source as string)
    : null
  if (creditCardRes instanceof Error) {
    return {error: {message: creditCardRes.message}, orgId}
  }
  // customers that used the new checkout flow with Stripe Elements will have a default_source. Previously, we'd store their creditCard in the org table
  const creditCard = creditCardRes ?? org.creditCard
  if (!creditCard) {
    return {error: {message: 'No credit card found'}, orgId}
  }
  const {last4, brand} = creditCard

  const notifications = billingLeaderUserIds.map((userId) => ({
    id: generateUID(),
    type: 'PAYMENT_REJECTED' as const,
    orgId,
    last4: Number(last4),
    brand,
    userId
  }))

  await pg.insertInto('Notification').values(notifications).execute()

  notifications.forEach((notification) => {
    const data = {orgId, notificationId: notification.id}
    publish(SubscriptionChannel.NOTIFICATION, orgId, 'StripeFailPaymentPayload', data)
  })

  const notificationId = notifications?.[0]?.id
  const data = {orgId, notificationId}
  return data
}

export default stripeFailPayment
