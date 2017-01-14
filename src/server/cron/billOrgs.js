import getRethink from 'server/database/rethinkDriver';
import {PAYMENT_REJECTED} from 'universal/utils/constants';
import shortid from 'shortid';
import ms from 'ms';
import {INACTIVE_DAYS_THRESH, TRIAL_EXTENSION} from 'server/utils/serverConstants';
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
    // get removed users
    const {id: orgId, removedUsers, validUntil} = orgsToBill[i];

    // get active users
    const activeUsers = await r.table('User')
      .getAll(orgId, {index: 'orgId'});

    // union active users and removed users
    const removedUserIds = removedUsers.map((user) => user.id);
    const activeUserIds = activeUsers.map((user) => user.id);
    const allUserIds = [...removedUserIds, ...activeUserIds];

    // get time of last invoice
    const invoiceStartAt = await r.table('Invoice')
      .getAll(orgId, {index: 'orgId'})
      .orderBy(r.desc('startAt'))
      .nth(0)('endAt')
      .default(new Date(validUntil.valueOf() - TRIAL_EXTENSION));

    // get inactivity periods
    // TODO when removing a user from an org, clear their inactivity
    const inactivityPeriods = await r.table('InactiveUser')
      .getAll(r.args(allUserIds), {index: 'userId'})
      .filter((row) => row('endAt').not()
        .or(row('endAt').ge(r.epochTime( invoiceStartAt / 1000)))
      )
      .merge((row) => ({
          startAt: r.min(row('startAt'), invoiceStartAt),
          endAt: row('endAt').default(now)
      }));

    const legitInactivity = inactivityPeriods.reduce((arr, doc) => {
      const {startAt, endAt} = doc;
      const daysInactive = Math.floor((endAt - startAt) / ms('1d'));
      if (daysInactive >= INACTIVE_DAYS_THRESH) {
        arr.push({
          ...doc,
          daysInactive
        })
      }
      return arr;
    }, []);

    // inactivityFromRemovals
    const inactivityFromRemovals = [];
    for (let j = 0 ; j < removedUsers.length; j++) {
      const {id: userId, removedAt} = removedUsers[j];
      const inactiveRemovedUser = legitInactivity.find((doc) => doc.userId === userId && doc.endAt === now);
      if (!inactiveRemovedUser) {
        inactivityFromRemovals.push({
          userId,
          startAt: removedAt,
          endAt: now,
          daysInactive: Math.floor((now - removedAt) / ms('1d'))
        })
      }
    }

    // create the invoice


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
