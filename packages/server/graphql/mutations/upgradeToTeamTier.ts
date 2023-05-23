import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import UpgradeToTeamTierPayload from '../types/UpgradeToTeamTierPayload'
import hideConversionModal from './helpers/hideConversionModal'
import upgradeToTeamTier from './helpers/upgradeToTeamTier'
import upgradeToTeamTierOld from './helpers/upgradeToTeamTierOld'

export default {
  type: UpgradeToTeamTierPayload,
  description: 'Upgrade an account to the paid service',
  args: {
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the org requesting the upgrade'
    },
    stripeToken: {
      type: GraphQLID,
      description: 'The token that came back from stripe'
    },
    paymentMethodId: {
      type: GraphQLID,
      description: 'The payment method id'
    }
  },
  async resolve(
    _source: unknown,
    {
      orgId,
      stripeToken,
      paymentMethodId
    }: {orgId: string; stripeToken?: string; paymentMethodId?: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)

    // VALIDATION
    const {
      stripeSubscriptionId: startingSubId,
      name: orgName,
      activeDomain: domain
    } = await r.table('Organization').get(orgId).run()

    if (startingSubId) {
      return standardError(new Error('Already an organization on the team tier'), {
        userId: viewerId
      })
    }

    // RESOLUTION
    // if they downgrade & are re-upgrading, they'll already have a stripeId
    const viewer = await dataLoader.get('users').load(viewerId)
    const {email} = viewer!
    let stripeSubscriptionClientSecret: string | null = null
    try {
      // TODO: remove upgradeToTeamTierOld once we rollout the new checkout flow: https://github.com/ParabolInc/parabol/milestone/150
      if (paymentMethodId) {
        stripeSubscriptionClientSecret = await upgradeToTeamTier(
          orgId,
          paymentMethodId,
          email,
          dataLoader
        )
      } else if (stripeToken) {
        await upgradeToTeamTierOld(orgId, stripeToken, email, dataLoader)
      }
    } catch (e) {
      const param = (e as any)?.param
      const error: any = param ? new Error(param) : e
      return standardError(error, {userId: viewerId, tags: error})
    }

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
      domain,
      orgName,
      oldTier: 'starter',
      newTier: 'team'
    })
    const data = {orgId, teamIds, meetingIds, stripeSubscriptionClientSecret}
    publish(SubscriptionChannel.ORGANIZATION, orgId, 'UpgradeToTeamTierPayload', data, subOptions)

    teamIds.forEach((teamId) => {
      // I can't readily think of a clever way to use the data obj and filter in the resolver so I'll reduce here.
      // This is probably a smelly piece of code telling me I should be sending this per-viewerId or per-org
      const teamData = {orgId, teamIds: [teamId]}
      publish(SubscriptionChannel.TEAM, teamId, 'UpgradeToTeamTierPayload', teamData, subOptions)
    })
    return data
  }
}
