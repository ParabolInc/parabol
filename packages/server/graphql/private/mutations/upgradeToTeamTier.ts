import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import removeTeamsLimitObjects from '../../../billing/helpers/removeTeamsLimitObjects'
import getRethink from '../../../database/rethinkDriver'
import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import setTierForOrgUsers from '../../../utils/setTierForOrgUsers'
import setUserTierForOrgId from '../../../utils/setUserTierForOrgId'
import standardError from '../../../utils/standardError'
import {getStripeManager} from '../../../utils/stripe'
import getCCFromCustomer from '../../mutations/helpers/getCCFromCustomer'
import hideConversionModal from '../../mutations/helpers/hideConversionModal'
import {MutationResolvers} from '../resolverTypes'

// included here to codegen has access to it
export type UpgradeToTeamTierSuccessSource = {
  orgId: string
  teamIds: string[]
  meetingIds: string[]
}

const upgradeToTeamTier: MutationResolvers['upgradeToTeamTier'] = async (
  _source,
  {invoiceId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const userId = getUserId(authToken)
  const manager = getStripeManager()
  const invoice = await manager.retrieveInvoice(invoiceId)
  const customerId = invoice.customer as string
  const customer = await manager.retrieveCustomer(customerId)
  if (customer.deleted) {
    return standardError(new Error('Customer has been deleted'), {userId})
  }
  const orgId = customer.metadata.orgId
  if (!orgId) {
    return standardError(new Error('Customer does not have an orgId'), {userId})
  }

  const r = await getRethink()
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const now = new Date()

  // AUTH
  const viewerId = getUserId(authToken)
  const [organization, viewer] = await Promise.all([
    dataLoader.get('organizations').load(orgId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])

  const {
    stripeId,
    tier,
    activeDomain,
    name: orgName,
    stripeSubscriptionId,
    trialStartDate
  } = organization

  if (!stripeId) {
    return standardError(new Error('Organization does not have a stripe id'), {
      userId: viewerId
    })
  }

  if (!stripeSubscriptionId) {
    return standardError(new Error('Organization does not have a subscription'), {userId: viewerId})
  }

  if (tier !== 'starter') {
    return standardError(new Error('Organization is not on the starter tier'), {
      userId: viewerId
    })
  }

  // RESOLUTION
  await Promise.all([
    r({
      updatedOrg: r
        .table('Organization')
        .get(orgId)
        .update({
          creditCard: await getCCFromCustomer(customer),
          tier: 'team',
          tierLimitExceededAt: null,
          scheduledLockAt: null,
          lockedAt: null,
          updatedAt: now,
          trialStartDate: null
        })
    }).run(),
    pg
      .updateTable('Team')
      .set({
        isPaid: true,
        tier: 'team',
        trialStartDate: null
      })
      .where('orgId', '=', orgId)
      .execute(),
    removeTeamsLimitObjects(orgId, dataLoader)
  ])
  organization.tier = 'team'

  await Promise.all([setUserTierForOrgId(orgId), setTierForOrgUsers(orgId)])

  const activeMeetings = await hideConversionModal(orgId, dataLoader)
  const meetingIds = activeMeetings.map(({id}) => id)

  await r
    .table('OrganizationUser')
    .getAll(viewerId, {index: 'userId'})
    .filter({removedAt: null, orgId})
    .update({role: 'BILLING_LEADER'})
    .run()

  const teams = await dataLoader.get('teamsByOrgIds').load(orgId)
  const teamIds = teams.map(({id}) => id)
  analytics.organizationUpgraded(viewer, {
    orgId,
    domain: activeDomain,
    isTrial: !!trialStartDate,
    orgName,
    oldTier: 'starter',
    newTier: 'team'
  })
  const data = {orgId, teamIds, meetingIds}
  publish(SubscriptionChannel.ORGANIZATION, orgId, 'UpgradeToTeamTierSuccess', data, subOptions)

  teamIds.forEach((teamId) => {
    const teamData = {orgId, teamIds: [teamId]}
    publish(SubscriptionChannel.TEAM, teamId, 'UpgradeToTeamTierSuccess', teamData, subOptions)
  })
  return data
}

export default upgradeToTeamTier
