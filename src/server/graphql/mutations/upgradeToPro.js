import {GraphQLID, GraphQLNonNull} from 'graphql'
import stripe from 'server/billing/stripe'
import getRethink from 'server/database/rethinkDriver'
import getCCFromCustomer from 'server/graphql/mutations/helpers/getCCFromCustomer'
import UpgradeToProPayload from 'server/graphql/types/UpgradeToProPayload'
import {getUserId, isUserBillingLeader} from 'server/utils/authorization'
import {fromEpochSeconds} from 'server/utils/epochTime'
import publish from 'server/utils/publish'
import sendSegmentEvent, {sendSegmentIdentify} from 'server/utils/sendSegmentEvent'
import {PARABOL_PRO_MONTHLY} from 'server/utils/serverConstants'
import {ORGANIZATION, PRO, TEAM} from 'universal/utils/constants'
import {sendOrgLeadAccessError} from 'server/utils/authorizationErrors'
import {sendAlreadyProTierError} from 'server/utils/alreadyMutatedErrors'

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
  async resolve (source, {orgId, stripeToken}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    if (!(await isUserBillingLeader(viewerId, orgId))) {
      return sendOrgLeadAccessError(authToken, orgId)
    }

    // VALIDATION
    const {quantity, stripeSubscriptionId: startingSubId, stripeId} = await r
      .table('Organization')
      .get(orgId)
      .merge((org) => ({
        quantity: r
          .table('OrganizationUser')
          .getAll(org('id'), {index: 'orgId'})
          .filter({removedAt: null})
          .count()
      }))

    if (startingSubId) return sendAlreadyProTierError(authToken, orgId)

    // RESOLUTION
    // if they downgrade & are re-upgrading, they'll already have a stripeId
    const customer = stripeId
      ? await stripe.customers.update(stripeId, {source: stripeToken})
      : await stripe.customers.create({
        source: stripeToken,
        metadata: {
          orgId
        }
      })

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      metadata: {
        orgId
      },
      items: [
        {
          plan: PARABOL_PRO_MONTHLY,
          quantity
        }
      ],
      trial_period_days: 0
    })
    const currentPeriodStart = subscription.current_period_start
    const currentPeriodEnd = subscription.current_period_end
    const creditCard = getCCFromCustomer(customer)
    const {teamIds} = await r({
      updatedOrg: r
        .table('Organization')
        .get(orgId)
        .update({
          creditCard,
          tier: PRO,
          periodEnd: fromEpochSeconds(currentPeriodEnd),
          periodStart: fromEpochSeconds(currentPeriodStart),
          stripeId: customer.id,
          stripeSubscriptionId: subscription.id,
          updatedAt: now
        }),
      teamIds: r
        .table('Team')
        .getAll(orgId, {index: 'orgId'})
        .update(
          {
            isPaid: true,
            tier: PRO,
            updatedAt: now
          },
          {returnChanges: true}
        )('changes')('new_val')('id')
        .default([])
    })
    sendSegmentEvent('Upgrade to Pro', viewerId, {orgId})
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
