import {GraphQLID, GraphQLNonNull} from 'graphql'
import adjustUserCount from 'server/billing/helpers/adjustUserCount'
import getRethink from 'server/database/rethinkDriver'
import {isOrgLeaderOfUser} from 'server/utils/authorization'
import {toEpochSeconds} from 'server/utils/epochTime'
import {MAX_MONTHLY_PAUSES, PAUSE_USER} from 'server/utils/serverConstants'
import {PERSONAL} from 'universal/utils/constants'
import {sendOrgLeadOfUserAccessError} from 'server/utils/authorizationErrors'
import sendAuthRaven from 'server/utils/sendAuthRaven'
import {sendAlreadyInactivatedUserError} from 'server/utils/alreadyMutatedErrors'
import InactivateUserPayload from 'server/graphql/types/InactivateUserPayload'

export default {
  type: InactivateUserPayload,
  description: 'pauses the subscription for a single user',
  args: {
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the user to pause'
    }
  },
  async resolve (source, {userId}, {authToken}) {
    const r = getRethink()

    // AUTH
    if (!(await isOrgLeaderOfUser(authToken, userId))) {
      return sendOrgLeadOfUserAccessError(authToken, userId, false)
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
      return sendAlreadyInactivatedUserError(authToken, userId)
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
      const breadcrumb = {
        message: 'Max monthly pauses exceeded for this user',
        category: 'Pauses exceeded',
        data: {userId}
      }
      return sendAuthRaven(authToken, 'Easy there', breadcrumb)
    }

    // TODO ping the user to see if they're currently online

    // RESOLUTION
    const orgIds = orgs.map((org) => org.id)
    await adjustUserCount(userId, orgIds, PAUSE_USER)

    // TODO wire up subscription
    return {userId}
  }
}
