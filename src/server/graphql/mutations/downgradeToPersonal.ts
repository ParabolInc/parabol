import {GraphQLID, GraphQLNonNull} from 'graphql'
import stripe from 'server/billing/stripe'
import getRethink from 'server/database/rethinkDriver'
import DowngradeToPersonalPayload from 'server/graphql/types/DowngradeToPersonalPayload'
import {sendAlreadyPersonalTierError} from 'server/utils/alreadyMutatedErrors'
import {getUserId, isUserBillingLeader, isSuperUser} from 'server/utils/authorization'
import {sendOrgLeadAccessError} from 'server/utils/authorizationErrors'
import publish from 'server/utils/publish'
import sendSegmentEvent, {sendSegmentIdentify} from 'server/utils/sendSegmentEvent'
import {ORGANIZATION, PERSONAL, TEAM} from 'universal/utils/constants'

export default {
  type: DowngradeToPersonalPayload,
  description: 'Downgrade a paid account to the personal service',
  args: {
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the org requesting the upgrade'
    }
  },
  async resolve (_source, {orgId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    if (!isSuperUser(authToken)) {
      if (!(await isUserBillingLeader(viewerId, orgId))) {
        return sendOrgLeadAccessError(authToken, orgId)
      }
    }

    // VALIDATION
    const {stripeSubscriptionId, tier} = await r.table('Organization').get(orgId)

    if (tier === PERSONAL) return sendAlreadyPersonalTierError(authToken, orgId)

    // RESOLUTION
    // if they downgrade & are re-upgrading, they'll already have a stripeId
    try {
      await stripe.subscriptions.del(stripeSubscriptionId)
    } catch (e) {
      console.log(e)
    }

    const {teamIds} = await r({
      org: r
        .table('Organization')
        .get(orgId)
        .update({
          creditCard: {},
          tier: PERSONAL,
          periodEnd: now,
          stripeSubscriptionId: null,
          updatedAt: now
        }),
      teamIds: r
        .table('Team')
        .getAll(orgId, {index: 'orgId'})
        .update(
          {
            tier: PERSONAL,
            isPaid: true,
            updatedAt: now
          },
          {returnChanges: true}
        )('changes')('new_val')('id')
        .default([])
    })
    sendSegmentEvent('Downgrade to personal', viewerId, {orgId})
    const data = {orgId, teamIds}
    publish(ORGANIZATION, orgId, DowngradeToPersonalPayload, data, subOptions)

    teamIds.forEach((teamId) => {
      // I can't readily think of a clever way to use the data obj and filter in the resolver so I'll reduce here.
      // This is probably a smelly piece of code telling me I should be sending this per-viewerId or per-org
      const teamData = {orgId, teamIds: [teamId]}
      publish(TEAM, teamId, DowngradeToPersonalPayload, teamData, subOptions)
    })
    // the count of this users tier stats just changed, update:
    const allUserIds = await r.table('User').getAll(orgId, {index: 'userOrgs'})('id')
    allUserIds.forEach((userId) => {
      sendSegmentIdentify(userId)
    })
    return data
  }
}
