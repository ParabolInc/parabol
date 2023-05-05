import {getUserId} from '../../../utils/authorization'
import {getStripeManager} from '../../../utils/stripe'
import {MutationResolvers} from '../resolverTypes'

const createSetupIntent: MutationResolvers['createSetupIntent'] = async (
  _source,
  {orgId},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const viewer = await dataLoader.get('users').loadNonNull(viewerId)
  const {email} = viewer
  const manager = getStripeManager()
  const customer = await manager.createCustomer(orgId, email)
  const amount = 1000
  const paymentIntent = await manager.createPaymentIntent(customer.id, amount)

  const {client_secret: clientSecret} = paymentIntent
  const data = {clientSecret}
  return data
}

export default createSetupIntent
