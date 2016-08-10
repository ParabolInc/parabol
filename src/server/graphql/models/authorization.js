import {errorObj} from './utils';

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
      throw errorObj({_error: 'Unauthorized to view team details.'});
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
