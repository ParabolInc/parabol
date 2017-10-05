import getRethink from 'server/database/rethinkDriver';
import {BILLING_LEADER, PERSONAL} from 'universal/utils/constants';

export default async function createNewOrg(orgId, orgName, leaderUserId) {
  const r = getRethink();
  const now = new Date();
  return r.table('Organization').insert({
    id: orgId,
    creditCard: {},
    createdAt: now,
    name: orgName,
    orgUsers: [{id: leaderUserId, role: BILLING_LEADER, inactive: false}],
    tier: PERSONAL,
    updatedAt: now
  }, {returnChanges: true})('changes')(0)('new_val');
}
