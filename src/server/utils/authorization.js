import {BILLING_LEADER} from 'universal/utils/constants';
import {qualifyingTiers, tierSupportsUpdateCheckInQuestion} from 'universal/utils/tierSupportsUpdateCheckInQuestion';
import getRethink from '../database/rethinkDriver';

export const getUserId = (authToken) => {
  return authToken && typeof authToken === 'object' && authToken.sub;
};

export const isSuperUser = (authToken) => {
  const userId = getUserId(authToken);
  return userId && authToken.rol === 'su';
};

export const getIsTeamLead = (teamMemberId) => {
  const r = getRethink();
  return r.table('TeamMember').get(teamMemberId)('isLead').default(false).run();
};

export const requireAuth = (authToken) => {
  if (!authToken) {
    throw new Error('Unauthorized. Must be logged in for this action.');
  }
};

/*
 * Won't return a teamMember if it's a super user
 */
export const requireSU = (authToken) => {
  if (!isSuperUser(authToken)) {
    throw new Error('Unauthorized. Must be a super user to run this query.');
  }
};

export const requireTeamMember = (authToken, teamId) => {
  const teams = authToken.tms || [];
  if (!teams.includes(teamId)) {
    throw new Error(`You do not have access to team ${teamId}`);
  }
};

export const requireOrgLeaderOrTeamMember = async (authToken, teamId) => {
  const r = getRethink();
  const teams = authToken.tms || [];
  if (!teams.includes(teamId)) {
    const userId = getUserId(authToken);
    const isOrgLeader = await r.table('Team').get(teamId)('orgId').default(null)
      .do((orgId) => {
        return r.table('User').get(userId)('userOrgs')
          .filter({
            id: orgId,
            role: BILLING_LEADER
          })
          .count()
          .eq(1)
          .default(false);
      });
    if (!isOrgLeader) {
      throw new Error(`Unauthorized to view details for team ${teamId} with token ${JSON.stringify(authToken)}`);
    }
  }
};

export const requireTeamLead = async (teamMemberId) => {
  const r = getRethink();
  const teamMember = await r.table('TeamMember').get(teamMemberId);
  if (!teamMember || !teamMember.isLead) {
    throw new Error('Unauthorized. Only the team leader promote someone to lead');
  }
  return teamMember;
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

export const requireOrgLeader = (userOrgDoc) => {
  const legit = isBillingLeader(userOrgDoc);
  if (!legit) {
    throw new Error('Unauthorized. User is not a Billing Leader for that organization');
  }
};

export const requireOrgLeaderOfUser = async (authToken, userId) => {
  const r = getRethink();
  const isLeaderOfUser = await r.table('User')
    .get(authToken.sub)('userOrgs')
    .filter({
      role: BILLING_LEADER
    })
    .map((userOrg) => userOrg('id'))
    .do((leaderOrgs) => {
      return {
        leaderOrgs,
        memberOrgs: r.table('User')
          .get(userId)('userOrgs')
          .map((userOrg) => userOrg('id'))
      };
    })
    .do((res) => {
      return res('leaderOrgs')
        .union(res('memberOrgs'))
        .distinct()
        .count()
        .lt(res('leaderOrgs').count().add(res('memberOrgs').count()));
    });
  if (!isLeaderOfUser) {
    throw new Error('Unauthorized. Only an Billing Leader of a user can set this');
  }
  return true;
};

export const requireUserInOrg = (userOrgDoc, userId, orgId) => {
  if (!userOrgDoc) {
    throw new Error(`Unauthorized. ${userId} does not belong in org ${orgId}`);
  }
  return true;
};

export const requireNotificationOwner = (userId, notification) => {
  if (notification && notification.userIds.includes(userId)) return true;
  throw new Error('Notification not found!');
};

export const requireTeamCanUpdateCheckInQuestion = async (teamId) => {
  const r = getRethink();

  const {tier} = await r
    .table('Team')
    .get(teamId)
    .pluck('tier');

  if (!tierSupportsUpdateCheckInQuestion(tier)) {
    throw new Error(
      `Unauthorized. Team billing tier must be one of {${qualifyingTiers.join(', ')}} to update the Check-in question. ` +
      `Actual tier is '${tier}'.`
    );
  }
  return true;
};
