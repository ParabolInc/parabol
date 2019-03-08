import {GraphQLID, GraphQLNonNull} from 'graphql'
import adjustUserCount from 'server/billing/helpers/adjustUserCount'
import getRethink from 'server/database/rethinkDriver'
import {getUserId, isOrgLeaderOfUser} from 'server/utils/authorization'
import {toEpochSeconds} from 'server/utils/epochTime'
import {MAX_MONTHLY_PAUSES, PAUSE_USER} from 'server/utils/serverConstants'
import {PERSONAL} from 'universal/utils/constants'
import InactivateUserPayload from 'server/graphql/types/InactivateUserPayload'
import standardError from 'server/utils/standardError'

export default {
  type: InactivateUserPayload,
  description: 'pauses the subscription for a single user',
  args: {
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the user to pause'
    }
  },
  async resolve(source, {userId}, {authToken}) {
    const r = getRethink()
    const viewerId = getUserId(authToken)
    // AUTH
    if (!(await isOrgLeaderOfUser(authToken, userId))) {
      return standardError(new Error('Not organization leader of user'), {userId: viewerId})
    }

    // VALIDATION
    const {user, orgs} = await r({
      user: r.table('User').get(userId),
      orgs: r
        .table('OrganizationUser')
        .getAll(userId, {index: 'userId'})
        .filter({removedAt: null})('orgId')
        .coerceTo('array')
        .do((orgIds) => {
          return r
            .table('Organization')
            .getAll(r.args(orgIds), {index: 'id'})
            .coerceTo('array')
        })
    })
    if (user.inactive) {
      return standardError(new Error('User already inactivated'), {userId: viewerId})
    }

    const hookPromises = orgs.map((orgDoc) => {
      const {periodStart, periodEnd, stripeSubscriptionId, tier} = orgDoc
      if (tier === PERSONAL) return undefined
      const periodStartInSeconds = toEpochSeconds(periodStart)
      const periodEndInSeconds = toEpochSeconds(periodEnd)
      return r
        .table('InvoiceItemHook')
        .between(periodStartInSeconds, periodEndInSeconds, {
          index: 'prorationDate'
        })
        .filter({
          stripeSubscriptionId,
          type: PAUSE_USER,
          userId
        })
        .count()
        .run()
    })
    const pausesByOrg = await Promise.all(hookPromises)
    const triggeredPauses = Math.max(...pausesByOrg)
    if (triggeredPauses >= MAX_MONTHLY_PAUSES) {
      return standardError(new Error('Max monthly pauses excheeded for this user'), {
        userId: viewerId
      })
    }

    // TODO ping the user to see if they're currently online

    // RESOLUTION
    const orgIds = orgs.map((org) => org.id)
    await adjustUserCount(userId, orgIds, PAUSE_USER)

    // TODO wire up subscription
    return {userId}
  }
}
