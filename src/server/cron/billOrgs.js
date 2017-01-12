import getRethink from 'server/database/rethinkDriver';
import {PAYMENT_REJECTED} from 'universal/utils/constants';
import shortid from 'shortid';
import ms from 'ms';
import {TRIAL_EXTENSION} from 'server/utils/serverConstants';
import stripe from 'server/utils/stripe';

// run at 12am everyday
// look for customers that will expire by 12am tomorrow

export default async function billOrgs() {
  const r = getRethink();
  const now = new Date();
  const billingThreshold = new Date(now.valueOf() + ms('1d'));

  // get orgs to bill
  const orgsToBill = await r.table('Organization')
    .between(r.minval, billingThreshold, {index: 'validUntil'})
    .filter({isTrial: false})
    .merge((org) => ({
      removedUsers: org('removedUsers')
        .filter((allRemoved) => allRemoved('removedAt').lt(r.epochTime(now / 1000)))
    }))
    .pluck('id', 'removedUsers', 'validUntil');

  // create invoice
  for (let i = 0; i < orgsToBill.length; i++) {
    const {id: orgId, removedUsers, validUntil} = orgsToBill[i];

    // get active users
    const activeUsers = await r.table('User')
      .getAll(orgId, {index: 'orgId'})

    // get removed users
    // const {removedUsers} = org;

    // get inactivity periods
    // get time of last invoice
    const invoiceStartAt = await r.table('Invoice')
      .getAll(orgId, {index: 'orgId'})
      .orderBy('startAt')
      .nth(0)('endAt')
      .default(validUntil - TRIAL_EXTENSION);

    const inactivityPeriods = await r.table('InactiveUser')
      .between([orgId, invoiceStartAt], [orgId, r.maxval], {index: 'orgIdStartAt'});

    // TODO send to stripe

    // if payment failed, invalidate team & add notification
    if (paymentFailed) {
      const orgLeaderIds = await r.table('User')
        .getAll(rejectedOrgId, {index: 'orgs'})('id');
      const parentId = shortid.generate();
      const notifications = orgLeaderIds.map((userId) => {
        return {
          id: shortid.generate(),
          errorMessage,
          last4,
          parentId,
          type: PAYMENT_REJECTED,
          startAt: now,
          endAt: new Date(now.valueOf() + ms('10y')),
          userId,
          orgId: rejectedOrgId,
        };
      });

      // disable app usage
      await r.table('Team')
        .getAll(rejectedOrgId, {index: 'orgId'})
        .update({
          isPaid: false
        })
        // give the leaders a notification
        .do(() => {
          return r.table('Notification').insert(notifications);
        })
    }

  }
}
