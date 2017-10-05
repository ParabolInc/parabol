import scSubscribeHandler from './scSubscribeHandler';
import scUnsubscribeHandler from './scUnsubscribeHandler';
import scGraphQLHandler from './scGraphQLHandler';
import {REFRESH_JWT_AFTER, UNPAUSE_USER} from 'server/utils/serverConstants';
import getRetink from 'server/database/rethinkDriver';
import isObject from 'universal/utils/isObject';
import jwtDecode from 'jwt-decode';
import adjustUserCount from 'server/billing/helpers/adjustUserCount';
import {fromEpochSeconds} from 'server/utils/epochTime';
import packageJSON from '../../../package.json';
import scRelaySubscribeHandler from 'server/socketHandlers/scRelaySubscribeHandler';
import unsubscribeRelaySub from 'server/utils/unsubscribeRelaySub';

const APP_VERSION = packageJSON.version;
// we do this otherwise we'd have to blacklist every token that ever got replaced & query that table for each query
const isTmsValid = (tmsFromDB = [], tmsFromToken = []) => {
  if (tmsFromDB.length !== tmsFromToken.length) return false;
  for (let i = 0; i < tmsFromDB.length; i++) {
    if (tmsFromDB[i] !== tmsFromToken[i]) return false;
  }
  return true;
};

export default function scConnectionHandler(exchange) {
  return async function connectionHandler(socket) {
    // socket.on('message', message => {
    //   if (message === '#2') return;
    //   console.log('SOCKET SAYS:', message);
    // });
    const subscribeHandler = scSubscribeHandler(exchange, socket);
    const unsubscribeHandler = scUnsubscribeHandler(exchange, socket);
    const graphQLHandler = scGraphQLHandler(exchange, socket);
    const relaySubscribeHandler = scRelaySubscribeHandler(socket);
    socket.on('message', (message) => {
      // if someone tries to replace their server-provided token with an older one that gives access to more teams, exit
      if (isObject(message) && message.event === '#authenticate') {
        const decodedToken = jwtDecode(message.data);
        const serverToken = socket.getAuthToken();
        if (decodedToken.exp < serverToken.exp) {
          socket.disconnect(4501, 'naughty nelly');
        }
      }
    });
    socket.on('graphql', graphQLHandler);
    socket.on('subscribe', subscribeHandler);
    socket.on('unsubscribe', unsubscribeHandler);
    socket.on('gqlSub', relaySubscribeHandler);
    socket.on('gqlUnsub', (opId) => {
      unsubscribeRelaySub(socket.subs, opId);
    });
    socket.on('disconnect', () => {
      if (socket.subs) {
        Object.keys(socket.subs).forEach((opId) => {
          unsubscribeRelaySub(socket.subs, opId);
        });
      }
    });

    // the async part should come last so there isn't a race
    const r = getRetink();
    const authToken = socket.getAuthToken();
    const {exp, tms, sub: userId} = authToken;
    const now = new Date();
    const tokenExpiration = fromEpochSeconds(exp);
    const timeLeftOnToken = tokenExpiration - now;
    // if the user was booted from the team, give them a new token
    const {inactive, tms: tmsDB, userOrgs} = await r.table('User').get(userId)
      .update({
        inactive: false,
        updatedAt: now,
        lastSeenAt: now
      }, {returnChanges: true})('changes')(0)('old_val').default({});

    const tmsIsValid = isTmsValid(tmsDB, tms);
    if (timeLeftOnToken < REFRESH_JWT_AFTER || !tmsIsValid) {
      const newAuthToken = {
        ...authToken,
        tms: tmsDB,
        exp: undefined
      };
      socket.setAuthToken(newAuthToken);
    }
    // no need to wait for this, it's just for billing
    if (inactive) {
      const orgIds = userOrgs.map(({id}) => id);
      adjustUserCount(userId, orgIds, UNPAUSE_USER);
    }
    // Emit current app version to notify client of possible change
    socket.emit('version', APP_VERSION);
  };
}
