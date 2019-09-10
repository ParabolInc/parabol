import {GraphQLID, GraphQLNonNull} from 'graphql'
import adjustUserCount from '../../billing/helpers/adjustUserCount'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isOrgLeaderOfUser} from '../../utils/authorization'
import {toEpochSeconds} from '../../utils/epochTime'
import {MAX_MONTHLY_PAUSES, PAUSE_USER} from '../../utils/serverConstants'
import InactivateUserPayload from '../types/InactivateUserPayload'
import standardError from '../../utils/standardError'
import {TierEnum} from 'parabol-client/types/graphql'

export default {
  type: InactivateUserPayload,
  description: 'pauses the subscription for a single user',
  args: {
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the user to pause'
    }
  },
  async resolve (_source, {userId}, {authToken}) {
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
      // TODO see if this is OK for enterprise
      if (tier === TierEnum.personal) return undefined
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
    const pausesByOrg = await Promise.all(hookPromises) as number[]
    const triggeredPauses = Math.max(...pausesByOrg)
    if (triggeredPauses >= MAX_MONTHLY_PAUSES) {
      return standardError(new Error('Max monthly pauses exceeded for this user'), {
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
