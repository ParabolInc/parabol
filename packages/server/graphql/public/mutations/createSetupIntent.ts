import {MONTHLY_PRICE} from 'parabol-client/utils/constants'
import {r} from 'rethinkdb-ts'
import {getUserId} from '../../../utils/authorization'
import {getStripeManager} from '../../../utils/stripe'
import {MutationResolvers} from '../resolverTypes'

const createSetupIntent: MutationResolvers['createSetupIntent'] = async (
  _source,
  {orgId},
  {dataLoader, authToken}
) => {
  const viewerId = getUserId(authToken)
  const [viewer, organization, organizationUser] = await Promise.all([
    dataLoader.get('users').loadNonNull(viewerId),
    dataLoader.get('organizations').load(orgId),
    dataLoader.get('organizationUsersByUserIdOrgId').load({userId: viewerId, orgId})
  ])
  const {email} = viewer
  if (!organizationUser) {
    return {error: 'Viewer does not belong to this organization'}
  }

  const {stripeId} = organization
  const manager = getStripeManager()
  const customer = stripeId
    ? await manager.retrieveCustomer(stripeId)
    : await manager.createCustomer(orgId, email)

  if (!stripeId) {
    r.table('Organization').get(orgId).update({stripeId: customer.id}).run()
  }

  await manager.createSetupIntent(customer.id)

  const data = {success: true}
  return data
}

export default createSetupIntent
