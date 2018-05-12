import {GraphQLID, GraphQLNonNull} from 'graphql';
import adjustUserCount from 'server/billing/helpers/adjustUserCount';
import getRethink from 'server/database/rethinkDriver';
import {isOrgLeaderOfUser} from 'server/utils/authorization';
import {toEpochSeconds} from 'server/utils/epochTime';
import {MAX_MONTHLY_PAUSES, PAUSE_USER} from 'server/utils/serverConstants';
import {PERSONAL} from 'universal/utils/constants';
import {sendOrgLeadOfUserAccessError} from 'server/utils/authorizationErrors';
import sendAuthRaven from 'server/utils/sendAuthRaven';
import {sendAlreadyInactivatedUserError} from 'server/utils/alreadyMutatedErrors';
import InactivateUserPayload from 'server/graphql/types/InactivateUserPayload';

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
    const r = getRethink();

    // AUTH
    if (!(await isOrgLeaderOfUser(authToken, userId))) {
      return sendOrgLeadOfUserAccessError(authToken, userId, false);
    }

    const orgDocs = await r
      .table('Organization')
      .getAll(userId, {index: 'orgUsers'})
      .pluck('id', 'orgUsers', 'periodStart', 'periodEnd', 'stripeSubscriptionId', 'tier');
    const firstOrgUser = orgDocs[0].orgUsers.find((orgUser) => orgUser.id === userId);
    if (!firstOrgUser) {
      // no userOrgs means there were no changes, which means inactive was already true
      return sendAlreadyInactivatedUserError(authToken, userId);
    }
    const hookPromises = orgDocs.map((orgDoc) => {
      const {periodStart, periodEnd, stripeSubscriptionId, tier} = orgDoc;
      if (tier === PERSONAL) return undefined;
      const periodStartInSeconds = toEpochSeconds(periodStart);
      const periodEndInSeconds = toEpochSeconds(periodEnd);
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
        .run();
    });
    const pausesByOrg = await Promise.all(hookPromises);
    const triggeredPauses = Math.max(...pausesByOrg);
    if (triggeredPauses >= MAX_MONTHLY_PAUSES) {
      const breadcrumb = {
        message: 'Max monthly pauses exceeded for this user',
        category: 'Pauses exceeded',
        data: {userId}
      };
      return sendAuthRaven(authToken, 'Easy there', breadcrumb);
    }

    // TODO ping the user to see if they're currently online

    // RESOLUTION
    await r({
      orgUpdate: r
        .table('Organization')
        .getAll(userId, {index: 'orgUsers'})
        .update((org) => ({
          orgUsers: org('orgUsers').map((orgUser) => {
            return r.branch(
              orgUser('id').eq(userId),
              orgUser.merge({
                inactive: true
              }),
              orgUser
            );
          })
        })),
      userUpdate: r
        .table('User')
        .get(userId)
        .update({
          inactive: true
        })
    });
    const orgIds = orgDocs.map((doc) => doc.id);
    await adjustUserCount(userId, orgIds, PAUSE_USER);

    // TOOD wire up subscription
    return {userId};
  }
};
