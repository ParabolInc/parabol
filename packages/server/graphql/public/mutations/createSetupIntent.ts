import {MONTHLY_PRICE} from 'parabol-client/utils/constants'
import {getUserId} from '../../../utils/authorization'
import {getStripeManager} from '../../../utils/stripe'
import {MutationResolvers} from '../resolverTypes'

const createSetupIntent: MutationResolvers['createSetupIntent'] = async (
  _source,
  {orgId},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const [viewer, organizationUsers] = await Promise.all([
    dataLoader.get('users').loadNonNull(viewerId),
    dataLoader.get('organizationUsersByOrgId').load(orgId)
  ])
  const inactiveUserCount = organizationUsers.filter(({inactive}) => inactive).length
  const activeUserCount = organizationUsers.length - inactiveUserCount
  const {email} = viewer
  const manager = getStripeManager()
  const customer = await manager.createCustomer(orgId, email)

  const amount = MONTHLY_PRICE * activeUserCount
  const paymentIntent = await manager.createPaymentIntent(customer.id, amount)

  const {client_secret: clientSecret} = paymentIntent
  const data = {clientSecret}
  return data
}

export default createSetupIntent
