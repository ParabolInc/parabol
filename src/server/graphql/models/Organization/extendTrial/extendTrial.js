import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt
} from 'graphql';
import {ACTION_MONTHLY} from 'server/utils/serverConstants';
import {TRIAL_EXPIRES_SOON, TRIAL_EXPIRED} from 'universal/utils/constants';
import {
  getUserSegmentTraits,
  requireSU,
} from 'server/utils/authorization';
import stripe from 'server/billing/stripe';
import {fromEpochSeconds} from 'server/utils/epochTime';
import segmentIo from 'server/segmentIo';
import {GraphQLEmailType} from 'server/graphql/types';

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
      .pluck('id', 'orgUsers', 'stripeId');

    if (orgs.length === 0) {
      throw new Error(`${email} is not a member of any organizations`);
    }

    const segmentTraits = await getUserSegmentTraits(userId);
    const trialArr = [TRIAL_EXPIRED, TRIAL_EXPIRES_SOON];

    const updates = orgs.map((org) => {
      const {id: orgId, orgUsers, stripeId} = org;
      const quantity = orgUsers.reduce((count, orgUser) => orgUser.inactive ? count : count + 1, 0);
      segmentIo.track({
        userId,
        event: 'Manual trial extension',
        properties: {
          orgId,
          traits: segmentTraits
        }
      });
      return stripe.subscriptions.create({
        customer: stripeId,
        metadata: {
          orgId
        },
        plan: ACTION_MONTHLY,
        quantity,
        trial_period_days: days
      })
        .then((subscription) => {
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
        });
    });
    await Promise.all(updates);


    return `${email} had ${orgs.length} trials extended to ${days} from now`;
  }
};
