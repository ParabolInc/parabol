import shortid from 'shortid';
import {TRIAL_PERIOD} from 'server/utils/serverConstants';
import ms from 'ms';
import {TRIAL_EXPIRED, TRIAL_EXPIRES_SOON} from 'universal/utils/constants'
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
  await Promise.all(tables);
  const indices = [
    r.table('Team').indexCreate('orgId'),
    r.table('Notification').indexCreate('orgId'),
    r.table('Notification').indexCreate('parentId'),
    r.table('Notification').indexCreate('userId'),

  ];
  await Promise.all(indices);

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
  const now = new Date();
  const trialExpiresAt = now + TRIAL_PERIOD;
  await r.expr(orggedLeaders)
    .forEach((leader) => {
      return r.table('Organization')
        .insert({
          id: leader('orgId'),
          billingLeaders: leader('billingLeaders'),
          createdAt: now,
          isTrial: true,
          name: leader('orgName'),
          updatedAt: now,
          validUntil: trialExpiresAt
        })
        .do(() => {
          return r.table('Team')
            .get(leader('teamId')).
            update({
              orgId: leader('orgId')
            })
        })
        .do(() => {
          return r.table('Notification')
            .insert([
              {
                id: leader('expiresSoonId'),
                parentId: leader('expiresSoonId'),
                type: TRIAL_EXPIRES_SOON,
                varList: leader('varList'),
                startAt: now + ms('14d'),
                endAt: trialExpiresAt,
                userId,
                orgId: leader('orgId'),
              },
              {
                id: leader('expiredId'),
                parentId: leader('expiredId'),
                type: TRIAL_EXPIRED,
                varList: leader('varList'),
                startAt: trialExpiresAt,
                endAt: trialExpiresAt + ms('10y'),
                userId,
                orgId: leader('orgId'),
              }
            ])
        })
    })
    .do(() => {
      return r.table('User').update({
        trialExpiresAt
      });
    });
};

exports.down = async(r) => {
  const tables = [
    r.tableDrop('Organization'),
    r.tableDrop('Notification'),
    r.table('Team').replace((row) => row.without('orgId')),
    r.table('User').replace((row) => row.without('trialExpiresAt'))
  ];
  await Promise.all(tables);
};
