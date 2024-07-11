import getRethink from '../../database/rethinkDriver'
import {RDatum} from '../../database/stricterR'
import {DataLoaderWorker} from '../../graphql/graphql'
import {OrganizationSource} from '../../graphql/public/types/Organization'
import {analytics} from '../../utils/analytics/analytics'
import {getStripeManager} from '../../utils/stripe'

const sendEnterpriseOverageEvent = async (
  organization: OrganizationSource,
  dataLoader: DataLoaderWorker
) => {
  const r = await getRethink()
  const manager = getStripeManager()
  const {id: orgId, stripeSubscriptionId} = organization
  if (!stripeSubscriptionId) return
  const [orgUserCount, subscriptionItem] = await Promise.all([
    r
      .table('OrganizationUser')
      .getAll(orgId, {index: 'orgId'})
      .filter({removedAt: null, inactive: false})
      .count()
      .run(),
    manager.getSubscriptionItem(stripeSubscriptionId)
  ])
  if (!subscriptionItem) return

  const quantity = subscriptionItem.quantity
  if (!quantity) return
  if (orgUserCount > quantity) {
    const billingLeaderOrgUser = await r
      .table('OrganizationUser')
      .getAll(orgId, {index: 'orgId'})
      .filter({removedAt: null})
      .filter((row: RDatum) => r.expr(['BILLING_LEADER', 'ORG_ADMIN']).contains(row('role')))
      .nth(0)
      .run()
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
