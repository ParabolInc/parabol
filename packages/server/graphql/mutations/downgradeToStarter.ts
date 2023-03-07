import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isSuperUser, isUserBillingLeader} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import DowngradeToStarterPayload from '../types/DowngradeToStarterPayload'
import {analytics} from '../../utils/analytics/analytics'
import sendToSentry from '../../utils/sendToSentry'
import ReasonToDowngradeEnum from '../types/ReasonToDowngrade'
import {ReasonToDowngradeEnum as TReasonToDowngradeEnum} from '../../../client/__generated__/DowngradeToStarterMutation.graphql'
import resolveDowngradeToStarter from './helpers/resolveDowngradeToStarter'
import {getBillingLeadersByOrgId} from '../../utils/getBillingLeadersByOrgId'

export default {
  type: DowngradeToStarterPayload,
  description: 'Downgrade a paid account to the starter service',
  args: {
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the org requesting the upgrade'
    },
    reasonsForLeaving: {
      type: new GraphQLList(ReasonToDowngradeEnum),
      description: 'the reasons the user is leaving'
    },
    otherTool: {
      type: GraphQLString,
      description:
        'the name of the tool they are moving to. only required if anotherTool is selected as a reason to downgrade'
    }
  },
  async resolve(
    _source: unknown,
    {
      orgId,
      reasonsForLeaving,
      otherTool
    }: {orgId: string; reasonsForLeaving?: TReasonToDowngradeEnum[]; otherTool?: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    if (!isSuperUser(authToken)) {
      if (!(await isUserBillingLeader(viewerId, orgId, dataLoader))) {
        return standardError(new Error('Not organization leader'), {userId: viewerId})
      }
    }

    // VALIDATION
    const {stripeSubscriptionId, tier} = await r.table('Organization').get(orgId).run()

    if (tier === 'starter') {
      return standardError(new Error('Already on free tier'), {userId: viewerId})
    }

    // RESOLUTION
    if (!isSuperUser(authToken)) {
      const [billingLeaders, organization] = await Promise.all([
        getBillingLeadersByOrgId(orgId, dataLoader),
        dataLoader.get('organizations').load(orgId)
      ])
      if (!billingLeaders[0]) {
        const error = new Error('Unable to find billing leader')
        sendToSentry(error, {userId: viewerId})
        return
      }
      analytics.organizationDowngraded(viewerId, {
        orgId,
        oldTier: tier,
        newTier: 'starter',
        billingLeaderEmail: billingLeaders[0].email,
        orgName: organization.name,
        reasonsForLeaving,
        otherTool
      })
    }
    // if they downgrade & are re-upgrading, they'll already have a stripeId
    await resolveDowngradeToStarter(orgId, stripeSubscriptionId!, viewerId)
    const teams = await dataLoader.get('teamsByOrgIds').load(orgId)
    const teamIds = teams.map(({id}) => id)
    const data = {orgId, teamIds}
    publish(SubscriptionChannel.ORGANIZATION, orgId, 'DowngradeToStarterPayload', data, subOptions)

    teamIds.forEach((teamId) => {
      // I can't readily think of a clever way to use the data obj and filter in the resolver so I'll reduce here.
      // This is probably a smelly piece of code telling me I should be sending this per-viewerId or per-org
      const teamData = {orgId, teamIds: [teamId]}
      publish(SubscriptionChannel.TEAM, teamId, 'DowngradeToStarterPayload', teamData, subOptions)
    })
    return data
  }
}
