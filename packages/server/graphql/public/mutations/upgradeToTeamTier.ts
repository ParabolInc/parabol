import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import removeTeamsLimitObjects from '../../../billing/helpers/removeTeamsLimitObjects'
import getRethink from '../../../database/rethinkDriver'
import updateTeamByOrgId from '../../../postgres/queries/updateTeamByOrgId'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import setTierForOrgUsers from '../../../utils/setTierForOrgUsers'
import setUserTierForOrgId from '../../../utils/setUserTierForOrgId'
import standardError from '../../../utils/standardError'
import {getStripeManager} from '../../../utils/stripe'
import hideConversionModal from '../../mutations/helpers/hideConversionModal'
import {MutationResolvers} from '../resolverTypes'

const upgradeToTeamTier: MutationResolvers['upgradeToTeamTier'] = async (
  _source,
  {orgId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const r = await getRethink()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const now = new Date()

  // AUTH
  const viewerId = getUserId(authToken)
  const organization = await dataLoader.get('organizations').load(orgId)
  const {stripeId, tier, activeDomain, name: orgName} = organization

  if (!stripeId) {
    return standardError(new Error('Organization does not have a stripe id'), {
      userId: viewerId
    })
  }

  const manager = getStripeManager()
  const existingSubscriptions = await manager.listActiveSubscriptions(stripeId)
  if (!existingSubscriptions.data.length) {
    return standardError(new Error('Organization already has a subscription'), {userId: viewerId})
  }

  if (tier !== 'starter') {
    return standardError(new Error('Organization is not on the starter tier'), {
      userId: viewerId
    })
  }

  // RESOLUTION
  await Promise.all([
    r({
      updatedOrg: r.table('Organization').get(orgId).update({
        tier: 'team',
        tierLimitExceededAt: null,
        scheduledLockAt: null,
        lockedAt: null,
        updatedAt: now
      })
    }).run(),
    updateTeamByOrgId(
      {
        isPaid: true,
        tier: 'team'
      },
      orgId
    ),
    removeTeamsLimitObjects(orgId, dataLoader)
  ])

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
  analytics.organizationUpgraded(viewerId, {
    orgId,
    domain: activeDomain,
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
