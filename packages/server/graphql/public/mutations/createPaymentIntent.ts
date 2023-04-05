import {MONTHLY_PRICE} from 'parabol-client/utils/constants'
import {getUserById} from '../../../postgres/queries/getUsersByIds'
import {getUserId} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import {getStripeManager} from '../../../utils/stripe'
import {MutationResolvers} from '../resolverTypes'

const createPaymentIntent: MutationResolvers['createPaymentIntent'] = async (
  _source,
  {orgId},
  {authToken, dataLoader}
) => {
  const userId = getUserId(authToken)
  const [user, organizationUser, organizationUsers] = await Promise.all([
    getUserById(userId),
    dataLoader.get('organizationUsersByUserIdOrgId').load({userId, orgId}),
    dataLoader.get('organizationUsersByOrgId').load(orgId)
  ])
  if (!organizationUser) {
    return standardError(new Error('User is not a part of that org'))
  }
  if (!user) {
    return standardError(new Error('User not found'))
  }

  // RESOLUTION
  const {email} = user
  const manager = getStripeManager()
  const activeOrganizationUsers = organizationUsers.filter(
    (organizationUser) => !organizationUser.inactive
  )
  const price = activeOrganizationUsers.length * MONTHLY_PRICE * 100
  // const customers = await manager.getCustomersByEmail(email)
  // console.log('🚀 ~ customers:', customers)
  // const existingCustomer = customers.data.find((customer) => customer.metadata.orgId === orgId)
  // const customer = existingCustomer ?? (await manager.createCustomer(orgId, email))
  // console.log('🚀 ~ customer:', customer)
  // const {id: customerId} = customer

  // const paymentIntent = await manager.createPaymentIntent(price, customerId)
  const paymentIntent = await manager.createPaymentIntent(price)
  console.log('🚀 ~ paymentIntent:', paymentIntent)
  // console.log('🚀 ~ paymentIntent:', {paymentIntent, customer})

  const {client_secret: clientSecret} = paymentIntent
  const data = {clientSecret}
  return data
}

export default createPaymentIntent
