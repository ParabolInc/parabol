import type {DataLoaderWorker} from '../../graphql/graphql'
import {enterpriseSeatOverages} from '../../metricsHandler'
import type {Organization} from '../../postgres/types'
import {getStripeManager} from '../../utils/stripe'

const countEnterpriseOverage = async (organization: Organization, dataLoader: DataLoaderWorker) => {
  const manager = getStripeManager()
  const {id: orgId, stripeSubscriptionId} = organization
  if (!stripeSubscriptionId) return
  const [activeOrgUsers, subscriptionItem] = await Promise.all([
    dataLoader.get('activeOrganizationUsersByOrgId').load(orgId),
    manager.getSubscriptionItem(stripeSubscriptionId)
  ])
  const orgUserCount = activeOrgUsers.length
  if (!subscriptionItem) return

  const quantity = subscriptionItem.quantity
  if (!quantity) return
  if (orgUserCount > quantity) {
    enterpriseSeatOverages.inc()
  }
}

const handleEnterpriseOrgQuantityChanges = async (
  paidOrgs: Organization[],
  dataLoader: DataLoaderWorker
) => {
  const enterpriseOrgs = paidOrgs.filter((org) => org.tier === 'enterprise')
  if (enterpriseOrgs.length === 0) return
  for (const org of enterpriseOrgs) {
    countEnterpriseOverage(org, dataLoader).catch(() => {
      /*ignore*/
    })
  }
}

export default handleEnterpriseOrgQuantityChanges
