import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import terminateSubscription from '../../../billing/helpers/terminateSubscription'
import getRethink from '../../../database/rethinkDriver'
import NotificationPaymentRejected from '../../../database/types/NotificationPaymentRejected'
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
  {authToken}
) => {
  // AUTH
  if (!isSuperUser(authToken)) {
    throw new Error('Don’t be rude.')
  }

  const r = await getRethink()
  const manager = getStripeManager()

  // VALIDATION
  const invoice = await manager.retrieveInvoice(invoiceId)
  const {customer, metadata, subscription, paid} = invoice
  const customerId = customer as string
  let maybeOrgId = metadata?.orgId
  if (!maybeOrgId) {
    const customer = await manager.retrieveCustomer(customerId)
    if ('metadata' in customer) {
      maybeOrgId = customer.metadata.orgId
    }
  }
  if (!maybeOrgId) {
    throw new Error(`Could not find orgId on invoice ${invoiceId}`)
  }
  // TS Error doesn't know if orgId stays a string or not
  const orgId = maybeOrgId
  const org = await r
    .table('Organization')
    .get(orgId)
    .pluck('creditCard', 'stripeSubscriptionId')
    .default(null)
    .run()

  if (!org) {
    // org no longer exists, can fail silently (useful for all the staging server bugs)
    return {error: {message: 'Org does not exist'}}
  }
  const {creditCard, stripeSubscriptionId} = org

  if (paid || stripeSubscriptionId !== subscription) return {orgId}

  // RESOLUTION
  await terminateSubscription(orgId)
  const billingLeaderUserIds = (await r
    .table('OrganizationUser')
    .getAll(orgId, {index: 'orgId'})
    .filter({removedAt: null, role: 'BILLING_LEADER'})('userId')
    .run()) as string[]
  const {last4, brand} = creditCard!

  const notifications = billingLeaderUserIds.map(
    (userId) => new NotificationPaymentRejected({orgId, last4, brand, userId})
  )

  await r({
    update: r.table('Invoice').get(invoiceId).update({status: 'FAILED'}),
    insert: r.table('Notification').insert(notifications)
  }).run()

  notifications.forEach((notification) => {
    const data = {orgId, notificationId: notification.id}
    publish(SubscriptionChannel.NOTIFICATION, orgId, 'StripeFailPaymentPayload', data)
  })

  const notificationId = notifications?.[0]?.id
  const data = {orgId, notificationId}
  return data
}

export default stripeFailPayment
