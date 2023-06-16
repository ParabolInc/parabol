import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import Stripe from 'stripe'
import removeTeamsLimitObjects from '../../../billing/helpers/removeTeamsLimitObjects'
import getRethink from '../../../database/rethinkDriver'
import updateTeamByOrgId from '../../../postgres/queries/updateTeamByOrgId'
import {getUserId, isUserBillingLeader} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import setTierForOrgUsers from '../../../utils/setTierForOrgUsers'
import setUserTierForOrgId from '../../../utils/setUserTierForOrgId'
import standardError from '../../../utils/standardError'
import {getStripeManager} from '../../../utils/stripe'
import getCCFromCustomer from '../../mutations/helpers/getCCFromCustomer'
import {MutationResolvers} from '../resolverTypes'

const updateCreditCard: MutationResolvers['updateCreditCard'] = async (
  _source,
  {orgId, paymentMethodId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const now = new Date()
  const r = await getRethink()

  // AUTH
  const viewerId = getUserId(authToken)
  if (!(await isUserBillingLeader(viewerId, orgId, dataLoader))) {
    return standardError(new Error('Must be the organization leader'), {userId: viewerId})
  }

  // RESOLUTION
  const organization = await dataLoader.get('organizations').load(orgId)
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
  const creditCard = await getCCFromCustomer(customer)

  try {
    await Promise.all([
      r({
        updatedOrg: r.table('Organization').get(orgId).update({
          creditCard,
          tier: 'team',
          stripeId: customer.id,
          tierLimitExceededAt: null,
          scheduledLockAt: null,
          lockedAt: null,
          updatedAt: now
        })
      }).run(),
      updateTeamByOrgId(
        {
          isPaid: true,
          tier: 'team'
        },
        orgId
      ),
      removeTeamsLimitObjects(orgId, dataLoader)
    ])
    await Promise.all([setUserTierForOrgId(orgId), setTierForOrgUsers(orgId)])
  } catch (e) {
    const error =
      e instanceof Error ? e : new Error('Failed to update db after updating credit card')
    console.log('🚀 ~ error:', error)
    return standardError(error, {userId: viewerId, tags: {orgId}})
  }
  organization.creditCard = creditCard

  const teams = await dataLoader.get('teamsByOrgIds').load(orgId)
  const teamIds = teams.map(({id}) => id)
  const latestInvoice = subscription.latest_invoice as Stripe.Invoice
  const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent
  const stripeSubscriptionClientSecret = paymentIntent.client_secret
  const data = {teamIds, orgId, stripeSubscriptionClientSecret}

  teamIds.forEach((teamId) => {
    publish(SubscriptionChannel.TEAM, teamId, 'UpdateCreditCardPayload', data, subOptions)
  })

  publish(SubscriptionChannel.ORGANIZATION, orgId, 'UpdateCreditCardPayload', data, subOptions)

  return data
}

export default updateCreditCard
