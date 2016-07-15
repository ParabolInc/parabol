import r from '../../database/rethinkDriver';
import {errorObj} from './utils';

export const getUserId = authToken => {
  return authToken && typeof authToken === 'object' && authToken.sub;
};

export const isSuperUser = authToken => {
  const userId = getUserId(authToken);
  return userId && authToken.rol === 'su';
};

export const getTeamMember = async (authToken, meetingId) => {
  const userId = getUserId(authToken);
  if (userId) {
    const teamMembers = await r.table('TeamMember')
      .getAll(meetingId, {index: 'meetingId'})
      .filter({userId: userId})
      .pluck('meetingId');
    return teamMembers[0];
  }
  return undefined;
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

export const requireSUOrTeamMember = async (authToken, meetingId) => {
  if (isSuperUser(authToken)) return undefined;
  const teamMember = await getTeamMember(authToken, meetingId);
  if (teamMember) return teamMember;
  console.log('throwin suo err', authToken, meetingId)
  throw errorObj({_error: 'Unauthorized to view meeting details.'});
};

export const requireSUOrSelf = (authToken, userId) => {
  if (isSuperUser(authToken)) return undefined;
  const authTokenUserId = getUserId(authToken);
  if (authTokenUserId === userId) {
    return userId;
  }
  throw errorObj({_error: 'Unauthorized. You cannot modify another user.'});
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
