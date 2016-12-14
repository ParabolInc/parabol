import shortid from 'shortid';
import {TRIAL_PERIOD} from '../../utils/serverConstants';
import ms from 'ms';
import {TRIAL_EXPIRED, TRIAL_EXPIRES_SOON} from '../../../universal/utils/constants'
/* eslint-disable max-len */
// taya, jordan, terry, matt
// const productTeam = [
//   'auth0|5797eb5d12664ba4675745b9',
//   'auth0|57a8fb6cab6c18473e47f518',
//   'auth0|5797e83170dddc395d8d1675',
//   'auth0|5797eb9712664ba4675745c3'
// ];
// const engineeringTeam = [
//   'auth0|57a8fb6cab6c18473e47f518',
//   'auth0|5797e83170dddc395d8d1675',
//   'auth0|5797eb9712664ba4675745c3'
// ];
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
    r.table('Team').indexCreate('orgId'),
    r.table('Organization').indexCreate('billingLeaders', {multi: true}),
    r.table('Notification').indexCreate('orgId'),
    r.table('Notification').indexCreate('parentId'),
    r.table('Notification').indexCreate('userId'),
    r.table('User').indexCreate('email'),
  ];
  try {
    await Promise.all(indices);
  } catch (e) {
  }

  const waitIndices = [
    r.table('Team').indexWait('orgId'),
    r.table('Organization').indexWait('billingLeaders'),
    r.table('Notification').indexWait('orgId', 'parentId', 'userId'),
    r.table('User').indexWait('email')
  ];
  await Promise.all(waitIndices);

  const now = new Date();
  const trialExpiresAt = new Date(now + TRIAL_PERIOD);
  const leaders = await r.table('TeamMember')
    .filter({isLead: true});
  const orggedLeaders = leaders.map((leader) => {
    return {
      ...leader,
      billingLeaders: [leader.userId],
      orgId: shortid.generate(),
      orgName: `${leader.preferredName}'s Org`,
      expiresSoonId: shortid.generate(),
      expiredId: shortid.generate(),
      varList: [trialExpiresAt],
    }
  });
  await r.expr(orggedLeaders)
    .forEach((leader) => {
      // add the org to the teams that the leader owns
      return r.table('Team')
        .get(leader('teamId')).update({
          orgId: leader('orgId')
        })
        // add the org itself
        .do(() => {
          return r.table('Organization')
            .insert({
              id: leader('orgId'),
              billingLeaders: leader('billingLeaders'),
              createdAt: now,
              isTrial: true,
              // get all the teams the leader leads, and all distinct users on those teams
              // don't get it from the table itself since the orgId doesn't exist yet
              members: r.table('TeamMember')
                    .getAll(leader('teamId'), {index: 'teamId'})('userId')
                    .distinct(),
              name: leader('orgName'),
              updatedAt: now,
              validUntil: trialExpiresAt
            })
        })
        // add expiry notifications
        .do(() => {
          return r.table('Notification')
            .insert([
              {
                id: leader('expiresSoonId'),
                parentId: leader('expiresSoonId'),
                type: TRIAL_EXPIRES_SOON,
                varList: leader('varList'),
                startAt: new Date(now + ms('14d')),
                endAt: trialExpiresAt,
                userId: leader('userId'),
                orgId: leader('orgId'),
              },
              {
                id: leader('expiredId'),
                parentId: leader('expiredId'),
                type: TRIAL_EXPIRED,
                varList: leader('varList'),
                startAt: trialExpiresAt,
                endAt: new Date(trialExpiresAt + ms('10y')),
                userId: leader('userId'),
                orgId: leader('orgId'),
              }
            ])
        })
        // set an expiry for every team leader
        .do(() => {
          return r.table('User').update({
            trialExpiresAt
          });
        });
    })
};

exports.down = async(r) => {
  const tables = [
    r.tableDrop('Organization'),
    r.tableDrop('Notification'),
    r.table('Team').indexDrop('orgId'),
    r.table('Team').replace((row) => row.without('orgId')),
    r.table('User').replace((row) => row.without('trialExpiresAt'))
  ];
  await Promise.all(tables);
};
