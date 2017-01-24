import shortid from 'shortid';
import ms from 'ms';
import {TRIAL_EXPIRES_SOON} from '../../../universal/utils/constants';
import stripe from '../../billing/stripe';
import {ACTION_MONTHLY, TRIAL_PERIOD_DAYS} from '../../utils/serverConstants';
import {fromStripeDate} from '../../billing/stripeDate';

/* eslint-disable max-len */

exports.up = async(r) => {
  const tables = [
    r.tableCreate('Organization'),
    r.tableCreate('Notification')
  ];
  try {
    await Promise.all(tables);
  } catch (e) {
  }
  const indices = [
    r.table('Organization').indexCreate('validUntil'),
    r.table('Team').indexCreate('orgId'),
    r.table('Notification').indexCreate('orgId'),
    r.table('Notification').indexCreate('parentId'),
    r.table('Notification').indexCreate('userId'),
    r.table('User').indexCreate('email'),
    r.table('User').indexCreate('orgs', {multi: true}),
    r.table('User').indexCreate('billingLeaderOrgs', {multi: true}),
  ];
  try {
    await Promise.all(indices);
  } catch (e) {
  }

  const waitIndices = [
    r.table('Team').indexWait('orgId'),
    r.table('Notification').indexWait('orgId', 'parentId', 'userId'),
    r.table('User').indexWait('email', 'orgs', 'billingLeaderOrgs')
  ];
  await Promise.all(waitIndices);

  const now = new Date();
  // const trialExpiresAt = new Date(now.getTime() + TRIAL_PERIOD);
  const teamLeaders = await r.table('TeamMember').filter({isLead: true});

  // get all the userIds of all the team leaders
  const teamLeaderUserIds = Array.from(new Set(teamLeaders.map((leader) => leader.userId)));
  const teamLeaderUsers = await r.table('User').getAll(r.args(teamLeaderUserIds), {index: 'id'});

  const orgIds = teamLeaderUsers.map(() => shortid.generate());
  const stripeCustomers = await Promise.all(orgIds.map((orgId) => stripe.customers.create({metadata: {orgId}})));
  const subscriptions = await Promise.all(stripeCustomers.map((customer) => {
    return stripe.subscriptions.create({
      customer: customer.id,
      metadata: {
        orgId: customer.metadata.orgId
      },
      plan: ACTION_MONTHLY,
      trial_period_days: TRIAL_PERIOD_DAYS
    });
  }));

  const orgs = subscriptions.map((sub, idx) => ({
    id: sub.metadata.orgId,
    billingLeaderOrgs: [sub.metadata.orgId],
    // userId is the default billing leader
    userId: teamLeaderUsers[idx].id,
    expiresSoonId: shortid.generate(),
    name: `${teamLeaderUsers[idx].preferredName}'s Org`,
    stripeId: sub.customer,
    stripeSubscriptionId: sub.id,
    trialExpiresAt: fromStripeDate(sub.trial_end)
  }));

  const teamsWithOrgId = teamLeaders.map((teamLeader) => {
    return {
      id: teamLeader.teamId,
      orgId: orgs.find(org => org.userId === teamLeader.userId).id
    }
  });

  // update teams with the org
  await r.expr(teamsWithOrgId).forEach((team) => r.table('Team').get(team('id')).update({orgId: team('orgId'), isPaid: true}))
  // add the org itself
    .do(() => {
      return r.expr(orgs)
        .forEach((org) => {
          return r.table('Organization')
            .insert({
              // user count is handled later
              id: org('id'),
              createdAt: now,
              isTrial: true,
              name: org('name'),
              stripeId: org('stripeId'),
              stripeSubscriptionId: org('stripeSubscriptionId'),
              updatedAt: now,
              validUntil: org('trialExpiresAt')
            })
            // add expiry notifications
            .do(() => {
              return r.table('Notification')
                .insert({
                  id: org('expiresSoonId'),
                  parentId: org('expiresSoonId'),
                  type: TRIAL_EXPIRES_SOON,
                  startAt: new Date(now.getTime() + ms('14d')),
                  endAt: org('trialExpiresAt'),
                  userId: org('userId'),
                  orgId: org('id'),
                  varList: [org('trialExpiresAt')]
                })
            })
            // mark this as the org that counts towards their trial
            .do(() => {
              return r.table('User')
                .get(org('userId'))
                .update({
                  billingLeaderOrgs: org('billingLeaderOrgs'),
                  trialOrg: org('id')
                });
            });
        })
    });
  // set org array on each user
  await r.table('User').update({
    orgs: r.table('Team').getAll(r.args(r.row('tms')), {index: 'id'})('orgId').distinct()
  }, {nonAtomic: true})
  ;

  // set user count on each org here since do clauses aren't guaranteed serial
  await r.expr(orgIds)
    .forEach((orgId) => {
      return r.table('Organization')
        .get(orgId)
        .update({
          activeUserCount: r.table('User').getAll(orgId, {index: 'orgs'}).count(),
          inactiveUserCount: 0
        }, {nonAtomic: true})
    })
};

exports.down = async(r) => {
  // removes ALL customers from stripe. DOING THIS SUCKS FOR DEV SINCE WE ALL HAVE DIFFERENT DBS
  // const stripeCustomers = [];
  // for (let i = 0; i < 100; i++) {
  //   const options = {limit: 100};
  //   if (i > 0) {
  //     options.starting_after = stripeCustomers[stripeCustomers.length - 1].id;
  //   }
  //   const customers = await stripe.customers.list(options);
  //   stripeCustomers.push(...customers.data);
  //   if (!customers.has_more) break;
  // }

  try {
    const stripeIds = await r.table('Organization')('stripeId');
    await Promise.all(stripeIds.map((id) => stripe.customers.del(id)));
  } catch(e) {
    console.log(`not all customers existed: ${e}`);
  }

  const tables = [
    r.tableDrop('Organization'),
    r.tableDrop('Notification'),
    r.table('Team').indexDrop('orgId'),
    r.table('User').indexDrop('email'),
    r.table('User').indexDrop('orgs'),
    r.table('User').indexDrop('billingLeaderOrgs'),
    r.table('Team').replace((row) => row.without('orgId')),
    r.table('User').replace((row) => row.without('trialOrg', 'orgs', 'billingLeaderOrgs')),
  ];
  try {
    await Promise.all(tables);
  } catch(e) {}
};
