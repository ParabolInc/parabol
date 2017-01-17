import getRethink from 'server/database/rethinkDriver';
import {
  ADD_USER,
  AUTO_PAUSE_USER,
  PAUSE_USER,
  REMOVE_USER,
  UNPAUSE_USER
} from 'server/utils/serverConstants';

// returns the delta to activeUserCount and inactiveUserCount
const adjustmentTable = {
  [ADD_USER]: [1,0],
  [AUTO_PAUSE_USER]: [-1, 1],
  [PAUSE_USER]: [-1, 1],
  [REMOVE_USER]: [-1, 0],
  [UNPAUSE_USER]: [1, -1],
};

import stripe from 'server/billing/stripe';
import shortid from 'shortid';
import {toStripeDate} from 'server/billing/stripeDate';

export default async function adjustUserCount(userId, orgInput, type) {
  const r = getRethink();
  const now = new Date();
  const [activeDelta, inactiveDelta] = adjustmentTable[type];
  const orgIds = Array.isArray(orgInput) ? orgInput : [orgInput];
  const {changes: orgChanges} = await r.table('Organization')
    .getAll(r.args(orgIds), {index: 'id'})
    .update((row) => ({
      activeUserCount: row('activeUserCount').add(activeDelta),
      inactiveUserCount: row('inactiveUserCount').add(inactiveDelta),
      updatedAt: now
    }), {returnChanges: true});

  const orgs = orgChanges.map((change) => change.new_val);
  const hooks = orgs.map((org) => ({
    id: shortid.generate(),
    subId: org.stripeSubscriptionId,
    prorationDate: toStripeDate(now),
    type,
    userId
  }));

  // wait here to make sure the webhook finds what it's looking for
  await r.table('InvoiceItemHook').insert(hooks);
  const stripePromises = orgs.map((org) => stripe.subscriptions.update(org.stripeSubscriptionId, {
    quantity: org.activeUserCount,
  }));

  await Promise.all(stripePromises);
}
