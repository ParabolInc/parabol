import {GraphQLInt, GraphQLNonNull, GraphQLString} from 'graphql';
import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';
import {GraphQLEmailType} from 'server/graphql/types';
import {requireSU} from 'server/utils/authorization';
import {fromEpochSeconds} from 'server/utils/epochTime';
import sendSegmentEvent from 'server/utils/sendSegmentEvent';
import {ACTION_MONTHLY} from 'server/utils/serverConstants';
import {TRIAL_EXPIRED, TRIAL_EXPIRES_SOON} from 'universal/utils/constants';

export default {
  type: GraphQLString,
  description: 'Extend the trial for all orgs owned by an email address for the given amount of days',
  args: {
    email: {
      type: new GraphQLNonNull(GraphQLEmailType),
      description: 'the email of the person to whom you are giving a free trial'
    },
    days: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of days for the free trial'
    }
  },
  async resolve(source, {email, days}, {authToken}) {
    const r = getRethink();

    // AUTH
    requireSU(authToken);

    // RESOLUTION
    const user = await r.table('User')
      .filter((doc) => doc('email').downcase().eq(email))
      .nth(0)
      .default(null);
    if (!user) {
      throw new Error(`${email} was not found on the server!`);
    }
    const userId = user.id;
    const orgs = await r.table('Organization')
      .getAll(user.id, {index: 'orgUsers'})
      .pluck('id', 'orgUsers', 'stripeId', 'stripeSubscriptionId');

    if (orgs.length === 0) {
      throw new Error(`${email} is not a member of any organizations`);
    }

    const trialArr = [TRIAL_EXPIRED, TRIAL_EXPIRES_SOON];

    await Promise.all(orgs.map(async (org) => {
      const {id: orgId, orgUsers, stripeId, stripeSubscriptionId} = org;
      const quantity = orgUsers.reduce((count, orgUser) => orgUser.inactive ? count : count + 1, 0);
      sendSegmentEvent('Manual trial extension', userId, {orgId});
      // delete existing sub
      await stripe.subscriptions.del(stripeSubscriptionId);

      // create a fresh one with a new trial period
      const subscription = await stripe.subscriptions.create({
        customer: stripeId,
        metadata: {
          orgId
        },
        plan: ACTION_MONTHLY,
        quantity,
        trial_period_days: days
      });

      const {id, current_period_end, current_period_start} = subscription;
      return r.table('Organization').get(orgId).update({
        periodEnd: fromEpochSeconds(current_period_end),
        periodStart: fromEpochSeconds(current_period_start),
        stripeSubscriptionId: id
      })
        .do(() => {
          return r.table('Team')
            .getAll(orgId, {index: 'orgId'})
            .update({
              isPaid: true
            });
        })
        .do(() => {
          return r.table('Notification')
            .getAll(orgId, {index: 'orgId'})
            .filter((n) => r.expr(trialArr).contains(n('type')))
            .delete();
        })
        .run();
    }));
    return `${email} had ${orgs.length} trials extended to ${days} from now`;
  }
};