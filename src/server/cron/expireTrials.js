import getRethink from 'server/database/rethinkDriver';
import {TRIAL_EXPIRED} from 'universal/utils/constants';
import shortid from 'shortid';
import ms from 'ms';
import markTeamsAsUnpaid from './helpers/markTeamsAsUnpaid';
import notifyOrgLeaders from './helpers/notifyOrgLeaders';

export default async function expireOrgs() {
  const r = getRethink();
  const now = new Date();
  const expiredOrgs = await r.table('Organization')
    .between(r.minval, now, {index: 'validUntil'})
    .filter({isTrial: true})
    .pluck('id');
  const createNotification = (orgId, parentId, userId) => ({
    id: shortid.generate(),
    parentId,
    type: TRIAL_EXPIRED,
    trialExpiresAt: now,
    startAt: now,
    endAt: new Date(now.valueOf() + ms('10y')),
    userId,
    orgId,
  });

  // flag teams as unpaid so subscriptions die. No need to kick them out since mutations won't do anything
  const dbPromises = [
    markTeamsAsUnpaid(expiredOrgs),
    notifyOrgLeaders(expiredOrgs, createNotification)
  ];
  await Promise.all(dbPromises);

}
