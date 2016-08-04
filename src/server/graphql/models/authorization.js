import r from 'server/database/rethinkDriver';
import {errorObj} from './utils';

export const getUserId = authToken => {
  return authToken && typeof authToken === 'object' && authToken.sub;
};

export const isSuperUser = authToken => {
  const userId = getUserId(authToken);
  return userId && authToken.rol === 'su';
};

export const getTeamMember = async(authToken, teamId) => {
  const userId = getUserId(authToken);
  if (userId) {
    const teamMembers = await r.table('TeamMember')
      .getAll(teamId, {index: 'teamId'})
      .filter({userId})
      .pluck('id', 'teamId');
    return teamMembers[0];
  }
  return undefined;
};

export const getUserIdFromTeamMember = async(teamMemberId) => {
  return await r.table('TeamMember').get(teamMemberId).pluck('userId');
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

export const requireSUOrTeamMember = async(authToken, teamId) => {
  if (isSuperUser(authToken)) return undefined;
  const teamMember = await getTeamMember(authToken, teamId);
  if (teamMember) return teamMember;
  throw errorObj({_error: 'Unauthorized to view team details.'});
};

export const requireSUOrSelf = (authToken, userId) => {
  if (isSuperUser(authToken)) return undefined;
  const authTokenUserId = getUserId(authToken);
  if (authTokenUserId === userId) {
    return userId;
  }
  throw errorObj({_error: 'Unauthorized. You cannot modify another user.'});
};

export const requireTeamMemberIsSelf = async (authToken, teamMemberId) => {
  const authTokenUserId = getUserId(authToken);
  const {userId} = await getUserIdFromTeamMember(teamMemberId);
  if (userId !== authTokenUserId) {
    console.log('COM', userId, authTokenUserId, authToken, teamMemberId)
    throw errorObj({_error: 'Unauthorized. Team member not linked to user.'});
  }
  return authTokenUserId;
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
