import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../postgres/getKysely'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import OldUpgradeToTeamTierPayload from '../types/OldUpgradeToTeamTierPayload'
import hideConversionModal from './helpers/hideConversionModal'
import oldUpgradeToTeamTier from './helpers/oldUpgradeToTeamTier'

// deprecating because we need to split up the subscription and upgrade logic to handle 3D Secure cards in the new checkout flow:  https://github.com/ParabolInc/parabol/issues/8278
export default {
  type: OldUpgradeToTeamTierPayload,
  description: 'Upgrade an account to the paid service',
  args: {
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the org requesting the upgrade'
    },
    stripeToken: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The token that came back from stripe'
    }
  },

  async resolve(
    _source: unknown,
    {orgId, stripeToken}: {orgId: string; stripeToken: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)

    // VALIDATION
    const {
      stripeSubscriptionId: startingSubId,
      name: orgName,
      activeDomain: domain
    } = await dataLoader.get('organizations').loadNonNull(orgId)

    if (startingSubId) {
      return standardError(new Error('Already an organization on the team tier'), {
        userId: viewerId
      })
    }

    // RESOLUTION
    // if they downgrade & are re-upgrading, they'll already have a stripeId
    const viewer = await dataLoader.get('users').loadNonNull(viewerId)
    const {email} = viewer
    try {
      await oldUpgradeToTeamTier(orgId, stripeToken, email, dataLoader)
    } catch (e) {
      const param = (e as any)?.param
      const error: any = param ? new Error(param) : e
      return standardError(error, {userId: viewerId, tags: error})
    }

    const activeMeetings = await hideConversionModal(orgId, dataLoader)
    const meetingIds = activeMeetings.map(({id}) => id)

    await getKysely()
      .updateTable('OrganizationUser')
      .set({role: 'BILLING_LEADER'})
      .where('userId', '=', viewerId)
      .where('orgId', '=', orgId)
      .where('removedAt', 'is', null)
      .execute()

    const teams = await dataLoader.get('teamsByOrgIds').load(orgId)
    const teamIds = teams.map(({id}) => id)
    analytics.organizationUpgraded(viewer, {
      orgId,
      domain: domain || undefined,
      orgName,
      oldTier: 'starter',
      newTier: 'team'
    })
    const data = {orgId, teamIds, meetingIds}
    publish(
      SubscriptionChannel.ORGANIZATION,
      orgId,
      'OldUpgradeToTeamTierPayload',
      data,
      subOptions
    )

    teamIds.forEach((teamId) => {
      // I can't readily think of a clever way to use the data obj and filter in the resolver so I'll reduce here.
      // This is probably a smelly piece of code telling me I should be sending this per-viewerId or per-org
      const teamData = {orgId, teamIds: [teamId]}
      publish(SubscriptionChannel.TEAM, teamId, 'OldUpgradeToTeamTierPayload', teamData, subOptions)
    })
    return data
  }
}
