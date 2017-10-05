import {BILLING_LEADER} from 'universal/utils/constants';
import getRethink from '../database/rethinkDriver';
import {errorObj} from './utils';

export const getUserId = (authToken) => {
  return authToken && typeof authToken === 'object' && authToken.sub;
};

export const isSuperUser = (authToken) => {
  const userId = getUserId(authToken);
  return userId && authToken.rol === 'su';
};

export const getIsTeamLead = (teamMemberId) => {
  const r = getRethink();
  return r.table('TeamMember').get(teamMemberId)('isLead').run();
};

export const requireAuth = (authToken) => {
  const userId = getUserId(authToken);
  if (userId) return userId;
  throw errorObj({_error: 'Unauthorized. Must be logged in for this action.'});
};

/*
 * Won't return a teamMember if it's a super user
 */
export const requireSU = (authToken) => {
  if (!isSuperUser(authToken)) {
    throw errorObj({_error: 'Unauthorized. Must be a super user to run this query.'});
  }
};

export const requireSUOrTeamMember = (authToken, teamId) => {
  if (!isSuperUser(authToken)) {
    const teams = authToken.tms || [];
    if (!teams.includes(teamId)) {
      throw errorObj({_error: `You do not have access to team ${teamId}`});
    }
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
      throw errorObj({_error: `Unauthorized to view details for team ${teamId} with token ${JSON.stringify(authToken)}`});
    }
  }
};

export const requireSUOrSelf = (authToken, userId) => {
  if (isSuperUser(authToken)) return undefined;
  const authTokenUserId = getUserId(authToken);
  if (authTokenUserId === userId) {
    return userId;
  }
  throw errorObj({_error: 'Unauthorized. You cannot modify another user.'});
};

export const requireSUOrSelfOrLead = async (authToken, userId, teamId) => {
  if (isSuperUser(authToken)) return undefined;
  const authTokenUserId = getUserId(authToken);
  if (authTokenUserId === userId) {
    return 'self';
  }
  const teamMemberId = `${authTokenUserId}::${teamId}`;
  const isTeamLead = await getIsTeamLead(teamMemberId);
  if (isTeamLead) {
    return 'lead';
  }
  throw errorObj({_error: 'Unauthorized. Only the team member or the leader can remove someone'});
};

export const requireSUOrLead = async (authToken, teamMemberId) => {
  if (isSuperUser(authToken)) return undefined;
  const r = getRethink();
  const teamMember = await r.table('TeamMember').get(teamMemberId);
  if (!teamMember || !teamMember.isLead) {
    throw errorObj({_error: 'Unauthorized. Only the team leader promote someone to lead'});
  }
  return teamMember;
};


export const requireWebsocket = (socket) => {
  if (!socket) {
    throw errorObj({_error: 'this must be called from a websocket'});
  }
};

export const requireWebsocketExchange = (exchange) => {
  if (!exchange) {
    throw errorObj({_error: 'this requires a websocket channel exchange'});
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
    throw errorObj({_error: 'Unauthorized. Only an Billing Leader of a user can set this'});
  }
  return true;
};

// VERY important, otherwise eg a user could "create" a new team with an existing teamId & force join that team
// this still isn't secure because the resolve could get called twice & make it past this point before 1 of them writes the insert
export const ensureUniqueId = async (table, id) => {
  const r = getRethink();
  const res = await r.table(table).get(id);
  if (res) {
    throw errorObj({type: 'unique id collision'});
  }
};

export const requireUserInOrg = (userOrgDoc, userId, orgId) => {
  if (!userOrgDoc) {
    throw errorObj({_error: `Unauthorized. ${userId} does not belong in org ${orgId}`});
  }
  return true;
};

export const requireNotificationOwner = (userId, notification) => {
  if (notification && notification.userIds.includes(userId)) return true;
  throw new Error('Notification not found!');
};
