import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import UpgradeToProPayload from '../types/UpgradeToProPayload'
import {getUserId, isUserBillingLeader} from '../../utils/authorization'
import publish from '../../utils/publish'
import sendSegmentEvent, {sendSegmentIdentify} from '../../utils/sendSegmentEvent'
import {ORGANIZATION, TEAM} from '../../../client/utils/constants'
import standardError from '../../utils/standardError'
import upgradeToPro from './helpers/upgradeToPro'
import {GQLContext} from '../graphql'

export default {
  type: UpgradeToProPayload,
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
  async resolve (
    _source,
    {orgId, stripeToken},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    if (!(await isUserBillingLeader(viewerId, orgId, dataLoader))) {
      return standardError(new Error('Must be the organization leader'), {userId: viewerId})
    }

    // VALIDATION
    const {stripeSubscriptionId: startingSubId} = await r.table('Organization').get(orgId)

    if (startingSubId) {
      return standardError(new Error('Already a pro organization'), {userId: viewerId})
    }

    // RESOLUTION
    // if they downgrade & are re-upgrading, they'll already have a stripeId
    await upgradeToPro(orgId, stripeToken)
    const teams = await dataLoader.get('teamsByOrgId').load(orgId)
    const teamIds = teams.map(({id}) => id)

    sendSegmentEvent('Upgrade to Pro', viewerId, {orgId}).catch()
    const data = {orgId, teamIds}
    publish(ORGANIZATION, orgId, UpgradeToProPayload, data, subOptions)

    teamIds.forEach((teamId) => {
      // I can't readily think of a clever way to use the data obj and filter in the resolver so I'll reduce here.
      // This is probably a smelly piece of code telling me I should be sending this per-viewerId or per-org
      const teamData = {orgId, teamIds: [teamId]}
      publish(TEAM, teamId, UpgradeToProPayload, teamData, subOptions)
    })
    // the count of this users tier stats just changed, update:
    await sendSegmentIdentify(viewerId)
    return data
  }
}
