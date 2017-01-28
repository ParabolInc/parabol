import {errorObj} from './utils';
import getRethink from '../database/rethinkDriver';

export const getUserId = authToken => {
  return authToken && typeof authToken === 'object' && authToken.sub;
};

export const isSuperUser = authToken => {
  const userId = getUserId(authToken);
  return userId && authToken.rol === 'su';
};

export const requireAuth = authToken => {
  const userId = getUserId(authToken);
  if (userId) return userId;
  throw errorObj({_error: 'Unauthorized. Must be logged in for this action.'});
};

/*
 * Won't return a teamMember if it's a super user
 */
export const requireSU = authToken => {
  if (!isSuperUser(authToken)) {
    throw errorObj({_error: 'Unauthorized. Must be a super user to run this query.'});
  }
};

export const requireSUOrTeamMember = (authToken, teamId) => {
  if (!isSuperUser(authToken)) {
    const teams = authToken.tms || [];
    if (!teams.includes(teamId)) {
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

export const requireSUOrSelfOrLead = async(authToken, userId, teamId) => {
  if (isSuperUser(authToken)) return undefined;
  const authTokenUserId = getUserId(authToken);
  if (authTokenUserId === userId) {
    return 'self';
  }
  const teamMemberId = `${authTokenUserId}::${teamId}`;
  const r = getRethink();
  const teamMember = await r.table('TeamMember').get(teamMemberId);
  if (teamMember && teamMember.isLead) {
    return 'lead';
  }
  throw errorObj({_error: 'Unauthorized. Only the team member or the leader can remove someone'});
};

export const requireSUOrLead = async(authToken, teamMemberId) => {
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

export const requireOrgLeader = async(authToken, orgId) => {
  const r = getRethink();
  const billingLeaderOrgs = await r.table('User').get(authToken.sub)('billingLeaderOrgs');
  if (!billingLeaderOrgs.includes(orgId)) {
    throw errorObj({_error: 'Unauthorized. Only an org billing Leader can do this'});
  }
  return authToken.sub;
};

export const validateNotificationId = async (notificationId, authToken) => {
  if (notificationId) {
    const userId = getUserId(authToken);
    const notification = await r.table('Notification').get(notificationId).pluck('userId', 'parentId');
    if (userId !== notification.userId) {
      throw errorObj({_error: 'cannot clear someone else\'s notification'});
    }
    return notification.parentId;
  }
  return undefined;
};

export const requireOrgLeaderOfUser = async(authToken, userId) => {
  const r = getRethink();
  const isLeaderOfUser = await r.table('User')
    .get(authToken.sub)('billingLeaderOrgs')
    .do((billingLeaderOrgs) => {
      return {
        billingLeaderOrgs,
        orgs: r.table('User')
          .get(userId)('orgs')
      }
    })
    .do((res) => {
      return res('billingLeaderOrgs')
        .union(res('orgs')).distinct().count()
        .lt(res('billingLeaderOrgs').count().add(res('orgs').count()))
    });
  if (!isLeaderOfUser) {
    throw errorObj({_error: 'Unauthorized. Only an billing leader of a user can set this'});
  }
  return true;
};

export const requireTeamIsPaid = async (teamId) => {
  const r = getRethink();
  const isPaid = await r.table('Team').get(teamId)('isPaid').default(false);
  if (!isPaid) {
    throw errorObj({_error: 'The org leader has not paid. Cannot fetch documents'})
  }
  return true;
};

// VERY important, otherwise eg a user could "create" a new team with an existing teamId & force join that team
export const ensureUniqueId = async (table, id) => {
  const r = getRethink();
  const res = await r.table(table).get(id);
  if (res) {
    throw errorObj({type: 'unique id collision'});
  }
};

export const ensureUserInOrg = async (userId, orgId) => {
  const r = getRethink();
  const inOrg = await r.table('User').get(userId)('orgs').contains(orgId);
  if (!inOrg) {
    throw errorObj({type: `user ${userId} does not belong to org ${orgId}`});
  }
  return true;
};
