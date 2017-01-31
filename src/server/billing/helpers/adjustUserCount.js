import getRethink from 'server/database/rethinkDriver';
import {
  ADD_USER,
  AUTO_PAUSE_USER,
  PAUSE_USER,
  REMOVE_USER,
  UNPAUSE_USER
} from 'server/utils/serverConstants';

const getPauseThunk = (inactive) => (userId, updatedAt, r) => (org) => ({
  orgUsers: org('orgUsers').map((orgUser) => {
    return r.branch(
      orgUser('id').eq(userId),
      orgUser.merge({
        inactive
      })
    )
  }),
  updatedAt
});

const getAddThunk = (userId, updatedAt, r) => (org) => ({
  orgUsers: org('orgUsers').append({
    id: userId
  }),
  updatedAt
});

const getDeleteThunk = (userId, updatedAt, r) => (org) => ({
  orgUsers: org('orgUsers').filter((orgUser) => orgUser('id').ne(userId)),
  updatedAt
});

const typeLookup = {
  [ADD_USER]: getAddThunk,
  [AUTO_PAUSE_USER]: getPauseThunk(true),
  [PAUSE_USER]: getPauseThunk(true),
  [REMOVE_USER]: getDeleteThunk,
  [UNPAUSE_USER]: getPauseThunk(false),
};

import stripe from 'server/billing/stripe';
import shortid from 'shortid';
import {toStripeDate} from 'server/billing/stripeDate';

export default async function adjustUserCount(userId, orgInput, type) {
  const r = getRethink();
  const now = new Date();
  const dbAction = typeLookup[type](userId, now, r);
  const orgIds = Array.isArray(orgInput) ? orgInput : [orgInput];
  const {changes: orgChanges} = await r.table('Organization')
    .getAll(r.args(orgIds), {index: 'id'})
    .update(dbAction, {returnChanges: true});
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
    quantity: org.orgUsers.reduce((count, orgUser) => orgUser.inactive ? count : count + 1)
  }));

  await Promise.all(stripePromises);
}
