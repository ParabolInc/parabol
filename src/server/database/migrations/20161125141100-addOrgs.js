import shortid from 'shortid';
import {BILLING_LEADER, TRIAL_EXPIRES_SOON} from '../../../universal/utils/constants';
import stripe from '../../billing/stripe';
import {ACTION_MONTHLY} from '../../utils/serverConstants';
import {fromEpochSeconds} from '../../utils/epochTime';
import ms from 'ms';

const TRIAL_PERIOD_DAYS = 30;
const TRIAL_EXPIRES_SOON_DELAY = ms('14d');
/* eslint-disable max-len */

exports.up = async (r) => {
  const tables = [
    r.tableCreate('Organization'),
    r.tableCreate('Notification')
  ];
  try {
    await Promise.all(tables);
  } catch (e) {
    // ignore
  }
  const indices = [
    // need index on periodEnd still?
    // r.table('Organization').indexCreate('periodEnd'),
    r.table('Organization').indexCreate('orgUsers', r.row('orgUsers')('id'), {multi: true}),
    r.table('ProjectHistory').indexCreate('teamMemberId'),
    r.table('Team').indexCreate('orgId'),
    r.table('Notification').indexCreate('orgId'),
    r.table('Notification').indexCreate('userIds', {multi: true}),
    // r.table('User').indexCreate('email'),
    r.table('User').indexCreate('userOrgs', r.row('userOrgs')('id'), {multi: true})
  ];
  try {
    await Promise.all(indices);
  } catch (e) {
    // ignore
  }

  const waitIndices = [
    r.table('Team').indexWait('orgId'),
    r.table('Notification').indexWait('orgId', 'userIds'),
    r.table('User').indexWait('userOrgs')
  ];
  await Promise.all(waitIndices);

  if (process.env.NODE_ENV === 'test') {
    console.warn('NODE_ENV is testing. Removing, not migrating prior users.');
    const purgeTasks = [
      r.table('Team').delete(),
      r.table('TeamMember').delete(),
      r.table('User').delete()
    ];
    await Promise.all(purgeTasks);
    return;
  }

  const now = new Date();
  // every team leader is going to be promoted to an org leader
  // this means if i was invited to a team then created my own team, where i'm the leader, that will be a new org
  const teamMembers = await r.table('TeamMember');
  const teamLeaders = teamMembers.filter((member) => member.isLead === true);
  const orgLookupByUserId = {};
  const orgLookupByTeam = {};
  for (let i = 0; i < teamLeaders.length; i++) {
    const teamLeader = teamLeaders[i];
    const {teamId, userId} = teamLeader;
    orgLookupByUserId[userId] = orgLookupByUserId[userId] || shortid.generate();
    orgLookupByTeam[teamId] = orgLookupByUserId[userId];
  }

  const orgs = {};
  const users = {};
  for (let i = 0; i < teamMembers.length; i++) {
    const teamMember = teamMembers[i];
    const {isLead, preferredName, userId, teamId} = teamMember;
    const orgId = orgLookupByTeam[teamId];
    teamMember.orgId = orgId;
    orgs[orgId] = orgs[orgId] || {};
    orgs[orgId].orgUserMap = orgs[orgId].orgUserMap || {};
    orgs[orgId].orgUserMap[userId] = isLead;
    users[userId] = users[userId] || {};
    users[userId].userOrgMap = users[userId].userOrgMap || {};
    users[userId].userOrgMap[orgId] = isLead;
    if (isLead) {
      orgs[orgId].leaderId = userId;
      orgs[orgId].name = `${preferredName}’s Org`;
      users[userId].trialOrg = orgId;
    }
  }
  const orgIds = Object.keys(orgs);
  const stripeCustomers = await Promise.all(orgIds.map((orgId) => stripe.customers.create({metadata: {orgId}})));
  const subscriptions = await Promise.all(stripeCustomers.map((customer) => {
    return stripe.subscriptions.create({
      customer: customer.id,
      metadata: customer.metadata,
      plan: ACTION_MONTHLY,
      quantity: Object.keys(orgs[customer.metadata.orgId].orgUserMap).length,
      trial_period_days: TRIAL_PERIOD_DAYS
    });
  }));
  const orgsForDB = [];
  const notificationsForDB = [];
  for (let i = 0; i < subscriptions.length; i++) {
    const subscription = subscriptions[i];
    const {metadata: {orgId}, customer, id, current_period_end, current_period_start} = subscription;
    const periodEnd = fromEpochSeconds(current_period_end);
    const {leaderId, name, orgUserMap} = orgs[orgId];
    const orgUserIds = Object.keys(orgUserMap);
    const orgUsers = [];
    for (let j = 0; j < orgUserIds.length; j++) {
      const orgUserId = orgUserIds[j];
      orgUsers[j] = {
        id: orgUserId,
        role: orgUserMap[orgUserId] ? BILLING_LEADER : null,
        inactive: false
      };
    }
    orgsForDB[i] = {
      id: orgId,
      createdAt: now,
      creditCard: {},
      name,
      orgUsers,
      stripeId: customer,
      stripeSubscriptionId: id,
      updatedAt: now,
      periodEnd,
      periodStart: fromEpochSeconds(current_period_start)
    };
    notificationsForDB[i] = {
      id: shortid.generate(),
      type: TRIAL_EXPIRES_SOON,
      startAt: new Date(now.getTime() + TRIAL_EXPIRES_SOON_DELAY),
      userIds: [leaderId],
      orgId,
      varList: [periodEnd]
    };
  }

  const usersForDB = [];
  const userIds = Object.keys(users);
  for (let i = 0; i < userIds.length; i++) {
    const userId = userIds[i];
    const user = users[userId];
    const {trialOrg, userOrgMap} = user;
    const userOrgs = [];
    const userOrgIds = Object.keys(userOrgMap);
    for (let j = 0; j < userOrgIds.length; j++) {
      const userOrgId = userOrgIds[j];
      userOrgs[j] = {
        id: userOrgId,
        role: userOrgMap[userOrgId] ? BILLING_LEADER : null
      };
    }
    usersForDB[i] = {
      id: userId,
      trialOrg,
      userOrgs
    };
  }

  // create updates to make to team docs
  const teamIds = Object.keys(orgLookupByTeam);
  const teamsForDB = [];
  for (let i = 0; i < teamIds.length; i++) {
    const teamId = teamIds[i];
    teamsForDB[i] = {
      id: teamId,
      orgId: orgLookupByTeam[teamId]
    };
  }

  const teamUpdates = r.expr(teamsForDB).forEach((team) => r.table('Team').get(team('id')).update({
    orgId: team('orgId'),
    isPaid: true
  }));

  const userUpdates = r.expr(usersForDB).forEach((user) => r.table('User').get(user('id')).update({
    inactive: false,
    trialOrg: user('trialOrg').default(null),
    userOrgs: user('userOrgs')
  }, {returnChanges: true}));

  const orgInserts = r.table('Organization').insert(orgsForDB);
  const notificationInserts = r.table('Notification').insert(notificationsForDB);

  try {
    await Promise.all([
      teamUpdates,
      userUpdates,
      orgInserts,
      notificationInserts
    ]);
  } catch (e) {
    console.log(e);
  }
};

exports.down = async (r) => {
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
  } catch (e) {
    console.log(`not all customers existed: ${e}`);
  }

  const tables = [
    r.tableDrop('Organization'),
    r.table('ProjectHistory').indexDrop('teamMemberId'),
    r.tableDrop('Notification'),
    r.table('Team').indexDrop('orgId'),
    // r.table('User').indexDrop('email'),
    r.table('User').indexDrop('userOrgs'),
    r.table('Team').replace((row) => row.without('orgId')),
    r.table('User').replace((row) => row.without('trialOrg', 'userOrgs'))
  ];
  try {
    await Promise.all(tables);
  } catch (e) {
    // ignore
  }
};
