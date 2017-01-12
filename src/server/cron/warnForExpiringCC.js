import getRethink from 'server/database/rethinkDriver';
import {CC_EXPIRING_SOON} from 'universal/utils/constants';
import shortid from 'shortid';
import ms from 'ms';
import notifyOrgLeaders from './helpers/notifyOrgLeaders';

// Run once a month, kinda expensive

export default async function warnForExpiringCC() {
  const r = getRethink();
  const now = new Date();
  const fullYear = String(now.getFullYear());
  const yearPrefix = fullYear.substr(0, 2);
  const yearSuffix = fullYear.substr(2);
  const expiryThreshold = new Date(now.valueOf() + ms('60d'));
  const expiringOrgs = await r.table('Organization')
    .filter((row) => {
      return row.js(
        `
        var expiry = row('creditCard')('expiry');
        var month = expiry.split('/')[0];
        var year = expiry.split('/')[1];
        var prefix = year < yearSuffix ? yearPrefix + 1 : yearPrefix;
        var expiryDate = new Date(prefix + year + '-' + month);
        return expiryDate < expiryThreshold;
        `
      )
    })
    .pluck('id', 'creditCard');

  const createNotification = (org, parentId, userId) => {
    const {last4, brand, expiry} = org.creditCard;
    return {
      id: shortid.generate(),
      parentId,
      type: CC_EXPIRING_SOON,
      last4,
      brand,
      expiry,
      startAt: now,
      endAt: new Date(now.valueOf() + ms('10y')),
      userId,
      orgId: org.id,
    }
  };
// flag teams as unpaid so subscriptions die. No need to kick them out since mutations won't do anything
  const dbPromises = [
    r.table('Team')
      .getAll(r.args(expiredOrgIds), {index: 'orgId'})
      .update({
        isPaid: false
      }),
    notifyOrgLeaders(expiringOrgs, createNotification)
  ];
  await Promise.all(dbPromises);
}
