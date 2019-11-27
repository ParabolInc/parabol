import {GraphQLID, GraphQLNonNull} from 'graphql'
import fetchAllLines from '../../../billing/helpers/fetchAllLines'
import terminateSubscription from '../../../billing/helpers/terminateSubscription'
import getRethink from '../../../database/rethinkDriver'
import StripeFailPaymentPayload from '../../types/StripeFailPaymentPayload'
import publish from '../../../utils/publish'
import shortid from 'shortid'
import {PAYMENT_REJECTED} from 'parabol-client/utils/constants'
import StripeManager from '../../../utils/StripeManager'
import {InvoiceStatusEnum, OrgUserRole} from 'parabol-client/types/graphql'
import {isSuperUser} from '../../../utils/authorization'
import {InternalContext} from '../../graphql'
import Organization from '../../../database/types/Organization'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

export default {
  name: 'StripeFailPayment',
  description: 'When stripe tells us an invoice payment failed, update it in our DB',
  type: StripeFailPaymentPayload,
  args: {
    invoiceId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The stripe invoice ID'
    }
  },
  resolve: async (_source, {invoiceId}, {authToken}: InternalContext) => {
    // AUTH
    if (!isSuperUser(authToken)) {
      throw new Error('Don’t be rude.')
    }

    const r = await getRethink()
    const now = new Date()
    const manager = new StripeManager()

    // VALIDATION
    const invoice = await manager.retrieveInvoice(invoiceId)
    const {amount_due: amountDue, customer, metadata, subscription, paid} = invoice
    const customerId = customer as string
    let orgId = metadata.orgId
    if (!orgId) {
      const customer = await manager.retrieveCustomer(customerId)
      orgId = customer.metadata.orgid
      if (!orgId) {
        throw new Error(`Could not find orgId on invoice ${invoiceId}`)
      }
    }
    const org = await r
      .table<Organization>('Organization')
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
    const stripeLineItems = await fetchAllLines(invoiceId)
    const nextPeriodCharges = stripeLineItems.find(
      (line) => line.description === null && line.proration === false
    )
    const nextPeriodAmount = (nextPeriodCharges && nextPeriodCharges.amount) || 0

    await terminateSubscription(orgId)
    const billingLeaderUserIds = await r
      .table('OrganizationUser')
      .getAll(orgId, {index: 'orgId'})
      .filter({removedAt: null, role: OrgUserRole.BILLING_LEADER})('userId')
      .run()
    const {last4, brand} = creditCard!
    // amount_due includes the old account_balance, so we can (kinda) atomically set this
    // we take out the charge for future services since we are ending service immediately
    await manager.updateAccountBalance(customerId, amountDue - nextPeriodAmount)

    const notificationId = shortid.generate()
    const notification = {
      id: notificationId,
      type: PAYMENT_REJECTED,
      startAt: now,
      orgId,
      userIds: billingLeaderUserIds,
      last4,
      brand
    }

    await r({
      update: r
        .table('Invoice')
        .get(invoiceId)
        .update({status: InvoiceStatusEnum.FAILED}),
      insert: r.table('Notification').insert(notification)
    }).run()
    const data = {orgId, notificationId}
    // TODO add in subOptins when we move GraphQL to its own microservice
    publish(SubscriptionChannel.NOTIFICATION, orgId, 'StripeFailPaymentPayload', data)
    return data
  }
}
