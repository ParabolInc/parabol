import {MONTHLY_PRICE} from 'parabol-client/utils/constants'
import {getUserId} from '../../../utils/authorization'
import {getStripeManager} from '../../../utils/stripe'
import {MutationResolvers} from '../resolverTypes'

const createPaymentIntent: MutationResolvers['createPaymentIntent'] = async (
  _source,
  {orgId},
  {authToken, dataLoader}
) => {
  const userId = getUserId(authToken)
  const [organizationUser, organizationUsers] = await Promise.all([
    dataLoader.get('organizationUsersByUserIdOrgId').load({userId, orgId}),
    dataLoader.get('organizationUsersByOrgId').load(orgId)
  ])
  if (!organizationUser) {
    throw new Error('User is not a part of that org')
  }

  // RESOLUTION
  const manager = getStripeManager()
  const activeOrganizationUsers = organizationUsers.filter(
    (organizationUser) => !organizationUser.inactive
  )
  const price = activeOrganizationUsers.length * MONTHLY_PRICE * 100
  const paymentIntent = await manager.createPaymentIntent(price)

  const {client_secret: clientSecret} = paymentIntent
  const data = {clientSecret}
  return data
}

export default createPaymentIntent
