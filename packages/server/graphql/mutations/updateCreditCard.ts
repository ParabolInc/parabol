import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getUserId, isUserBillingLeader} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import UpdateCreditCardPayload from '../types/UpdateCreditCardPayload'
import upgradeToTeamTier from './helpers/upgradeToTeamTier'

export default {
  type: UpdateCreditCardPayload,
  description: 'Update an existing credit card on file',
  args: {
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the org requesting the changed billing'
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
    if (!(await isUserBillingLeader(viewerId, orgId, dataLoader))) {
      return standardError(new Error('Must be the organization leader'), {userId: viewerId})
    }

    // RESOLUTION
    const viewer = (await dataLoader.get('users').load(viewerId))! // authenticated user
    try {
      await upgradeToTeamTier(orgId, stripeToken, viewer.email, dataLoader)
    } catch (e) {
      const param = (e as any)?.param
      const error: any = param ? new Error(param) : e
      return standardError(error, {userId: viewerId, tags: error})
    }

    const teams = await dataLoader.get('teamsByOrgIds').load(orgId)
    const teamIds = teams.map(({id}) => id)
    const data = {teamIds, orgId}

    teamIds.forEach((teamId) => {
      publish(SubscriptionChannel.TEAM, teamId, 'UpdateCreditCardPayload', data, subOptions)
    })

    publish(SubscriptionChannel.ORGANIZATION, orgId, 'UpdateCreditCardPayload', data, subOptions)

    return data
  }
}
