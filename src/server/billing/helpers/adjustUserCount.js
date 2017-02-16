import getRethink from 'server/database/rethinkDriver';
import {
  ADD_USER,
  AUTO_PAUSE_USER,
  PAUSE_USER,
  REMOVE_USER,
  UNPAUSE_USER
} from 'server/utils/serverConstants';

const changePause = (inactive) => async (orgIds, userId) => {
  const r = getRethink();
  return await r.table('User').get(userId)
    .update({inactive})
    .do(() => {
      return r.table('Organization')
        .getAll(r.args(orgIds), {index: 'id'})
        .update((org) => ({
          orgUsers: org('orgUsers').map((orgUser) => {
            return r.branch(
              orgUser('id').eq(userId),
              orgUser.merge({
                inactive
              }),
              orgUser
            )
          }),
          updatedAt: new Date()
        }), {returnChanges: true})
    });
};

const addUser = async (orgIds, userId) => {
  const r = getRethink();
  const userOrgAdditions = orgIds.map((id) => ({
    id,
    role: null
  }));
  return await r.table('User').get(userId)
    .update((user) => ({
      userOrgs: user('userOrgs').add(userOrgAdditions)
    }))
    .do(() => {
      return r.table('Organization')
        .getAll(r.args(orgIds), {index: 'id'})
        .update((org) => ({
          orgUsers: org('orgUsers').append({
            id: userId,
            inactive: false
          }),
          updatedAt: new Date()
        }), {returnChanges: true})
    });
};

const deleteUser = async (orgIds, userId) => {
  const r = getRethink();
  return await r.table('User').get(userId)
    .update((user) => ({
      userOrgs: user('userOrgs').filter((userOrg) => r.expr(orgIds).contains(userOrg('id')).not())
    }))
    .do(() => {
      return r.table('Organization')
        .getAll(r.args(orgIds), {index: 'id'})
        .update((org) => ({
          orgUsers: org('orgUsers').filter((orgUser) => orgUser('id').ne(userId)),
          updatedAt: new Date()
        }), {returnChanges: true})
    });
};

const typeLookup = {
  [ADD_USER]: addUser,
  [AUTO_PAUSE_USER]: changePause(true),
  [PAUSE_USER]: changePause(true),
  [REMOVE_USER]: deleteUser,
  [UNPAUSE_USER]: changePause(false),
};

import stripe from 'server/billing/stripe';
import shortid from 'shortid';
import {toEpochSeconds} from 'server/utils/epochTime';

export default async function adjustUserCount(userId, orgInput, type) {
  const r = getRethink();
  const now = new Date();
  const orgIds = Array.isArray(orgInput) ? orgInput : [orgInput];
  const dbAction = typeLookup[type];
  const {changes: orgChanges} = await dbAction(orgIds, userId);
  const orgs = orgChanges.map((change) => change.new_val);
  const hooks = orgs.map((org) => ({
    id: shortid.generate(),
    subId: org.stripeSubscriptionId,
    prorationDate: toEpochSeconds(now),
    type,
    userId
  }));
  // wait here to make sure the webhook finds what it's looking for
  await r.table('InvoiceItemHook').insert(hooks);
  const stripePromises = orgs.map((org) => stripe.subscriptions.update(org.stripeSubscriptionId, {
    quantity: org.orgUsers.reduce((count, orgUser) => orgUser.inactive ? count : count + 1, 0)
  }));

  await Promise.all(stripePromises);
}
