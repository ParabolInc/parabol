import {BILLING_LEADER, PERSONAL} from 'universal/utils/constants';
import getRethink from '../database/rethinkDriver';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

export const getUserId = (authToken) => {
  return authToken && typeof authToken === 'object' && authToken.sub;
};

export const isAuthenticated = (authToken) => Boolean(authToken);

export const isSuperUser = (authToken) => {
  const userId = getUserId(authToken);
  return userId && authToken.rol === 'su';
};

export const isTeamMember = (authToken, teamId) => {
  const {tms} = authToken;
  return Array.isArray(tms) && tms.includes(teamId);
};

export const isTeamLead = async (userId, teamId) => {
  const r = getRethink();
  const teamMemberId = toTeamMemberId(teamId, userId);
  return r.table('TeamMember').get(teamMemberId)('isLead').default(false).run();
};

export const requireSU = (authToken) => {
  if (!isSuperUser(authToken)) {
    throw new Error('Unauthorized. Must be a super user to run this query.');
  }
};

// undefined orgId will disable the filter
export const getUserOrgDoc = (userId, orgId = '') => {
  const r = getRethink();
  return r.table('User').get(userId)('userOrgs')
    .filter({id: orgId})
    .nth(0)
    .default(null)
    .run();
};

export const isBillingLeader = (userOrgDoc) => {
  return (userOrgDoc && userOrgDoc.role === BILLING_LEADER);
};

export const isOrgLeaderOfUser = async (authToken, userId) => {
  const r = getRethink();
  return r.table('User')
    .get(authToken.sub)('userOrgs')
    .filter({
      role: BILLING_LEADER
    })('id')
    .do((leaderOrgs) => {
      return {
        leaderOrgs,
        memberOrgs: r.table('User')
          .get(userId)('userOrgs')('id')
      };
    })
    .do((res) => {
      return res('leaderOrgs')
        .union(res('memberOrgs'))
        .distinct()
        .count()
        .lt(res('leaderOrgs').count().add(res('memberOrgs').count()));
    });
};

export const isPaidTier = async (teamId) => {
  const r = getRethink();
  const tier = await r
    .table('Team')
    .get(teamId)('tier');
  return tier !== PERSONAL;
};
