import Stripe from 'stripe'
import getRethink from '../../../database/rethinkDriver'
import {getUserId} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import {getStripeManager} from '../../../utils/stripe'
import {MutationResolvers} from '../resolverTypes'

const createStripeSubscription: MutationResolvers['createStripeSubscription'] = async (
  _source,
  {orgId, paymentMethodId},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const r = await getRethink()

  const [viewer, organization, orgUsersCount, organizationUser] = await Promise.all([
    dataLoader.get('users').loadNonNull(viewerId),
    dataLoader.get('organizations').load(orgId),
    r
      .table('OrganizationUser')
      .getAll(orgId, {index: 'orgId'})
      .filter({removedAt: null, inactive: false})
      .count()
      .run(),
    dataLoader.get('organizationUsersByUserIdOrgId').load({orgId, userId: viewerId})
  ])

  if (!organizationUser)
    return standardError(new Error('Unable to create subscription'), {
      userId: viewerId
    })

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
    customer = await manager.createCustomer(orgId, email, paymentMethodId)
  }

  const subscription = await manager.createTeamSubscription(customer.id, orgId, orgUsersCount)

  const latestInvoice = subscription.latest_invoice as Stripe.Invoice
  const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent
  const clientSecret = paymentIntent.client_secret

  const data = {stripeSubscriptionClientSecret: clientSecret}
  return data
}

export default createStripeSubscription
