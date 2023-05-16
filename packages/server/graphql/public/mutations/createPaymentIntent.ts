import {MONTHLY_PRICE} from 'parabol-client/utils/constants'
import {r} from 'rethinkdb-ts'
import {getStripeManager} from '../../../utils/stripe'
import {MutationResolvers} from '../resolverTypes'

const createPaymentIntent: MutationResolvers['createPaymentIntent'] = async (
  _source,
  {orgId},
  {dataLoader}
) => {
  const [organizationUsers, organization] = await Promise.all([
    dataLoader.get('organizationUsersByOrgId').load(orgId),
    dataLoader.get('organizations').load(orgId)
  ])
  const {stripeId} = organization
  const inactiveUserCount = organizationUsers.filter(({inactive}) => inactive).length
  const activeUserCount = organizationUsers.length - inactiveUserCount
  const manager = getStripeManager()
  const customer = stripeId
    ? await manager.retrieveCustomer(stripeId)
    : await manager.createCustomer(orgId)

  if (!stripeId) {
    r.table('Organization').get(orgId).update({stripeId: customer.id}).run()
  }

  const amount = MONTHLY_PRICE * 100 * activeUserCount
  const paymentIntent = await manager.createPaymentIntent(customer.id, amount)

  const {client_secret: clientSecret} = paymentIntent
  const data = {clientSecret}
  return data
}

export default createPaymentIntent
