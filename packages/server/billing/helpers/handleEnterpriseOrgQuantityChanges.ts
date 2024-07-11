import {DataLoaderWorker} from '../../graphql/graphql'
import {OrganizationSource} from '../../graphql/public/types/Organization'
import {analytics} from '../../utils/analytics/analytics'
import {getStripeManager} from '../../utils/stripe'

const sendEnterpriseOverageEvent = async (
  organization: OrganizationSource,
  dataLoader: DataLoaderWorker
) => {
  const manager = getStripeManager()
  const {id: orgId, stripeSubscriptionId} = organization
  if (!stripeSubscriptionId) return
  const [orgUsers, subscriptionItem] = await Promise.all([
    dataLoader.get('organizationUsersByOrgId').load(orgId),
    manager.getSubscriptionItem(stripeSubscriptionId)
  ])
  const activeOrgUsers = orgUsers.filter(({inactive}) => !inactive)
  const orgUserCount = activeOrgUsers.length
  if (!subscriptionItem) return

  const quantity = subscriptionItem.quantity
  if (!quantity) return
  if (orgUserCount > quantity) {
    const billingLeaderOrgUser = orgUsers.find(
      ({role}) => role && ['BILLING_LEADER', 'ORG_ADMIN'].includes(role)
    )!
    const {id: userId} = billingLeaderOrgUser
    const user = await dataLoader.get('users').loadNonNull(userId)
    analytics.enterpriseOverUserLimit(user, orgId)
  }
}

const handleEnterpriseOrgQuantityChanges = async (
  paidOrgs: OrganizationSource[],
  dataLoader: DataLoaderWorker
) => {
  const enterpriseOrgs = paidOrgs.filter((org) => org.tier === 'enterprise')
  if (enterpriseOrgs.length === 0) return
  for (const org of enterpriseOrgs) {
    sendEnterpriseOverageEvent(org, dataLoader).catch()
  }
}

export default handleEnterpriseOrgQuantityChanges
