import jwtDecode from 'jwt-decode';
import adjustUserCount from 'server/billing/helpers/adjustUserCount';
import getRetink from 'server/database/rethinkDriver';
import scRelaySubscribeHandler from 'server/socketHandlers/scRelaySubscribeHandler';
import {fromEpochSeconds} from 'server/utils/epochTime';
import {REFRESH_JWT_AFTER, UNPAUSE_USER} from 'server/utils/serverConstants';
import unsubscribeRelaySub from 'server/utils/unsubscribeRelaySub';
import isObject from 'universal/utils/isObject';
import packageJSON from '../../../package.json';
import scGraphQLHandler from './scGraphQLHandler';
import scSubscribeHandler from './scSubscribeHandler';

const APP_VERSION = packageJSON.version;

// we do this otherwise we'd have to blacklist every token that ever got replaced & query that table for each query
const isTmsValid = (tmsFromDB = [], tmsFromToken = []) => {
  if (tmsFromDB.length !== tmsFromToken.length) return false;
  for (let i = 0; i < tmsFromDB.length; i++) {
    if (tmsFromDB[i] !== tmsFromToken[i]) return false;
  }
  return true;
};

export default function scConnectionHandler(exchange, sharedDataLoader) {
  return async function connectionHandler(socket) {
    const r = getRetink();
    const now = new Date();
    // socket.on('message', message => {
    //   if (message === '#2') return;
    //   console.log('SOCKET SAYS:', message);
    // });
    const subscribeHandler = scSubscribeHandler(exchange, socket);
    const graphQLHandler = scGraphQLHandler(exchange, socket, sharedDataLoader);
    const relaySubscribeHandler = scRelaySubscribeHandler(socket, sharedDataLoader);
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
    socket.on('gqlSub', relaySubscribeHandler);
    socket.on('gqlUnsub', (opId) => {
      const subscriptionContext = socket.subs[opId];
      if (!subscriptionContext) {
        // the we must be trying to subscribe to something that caught an error
        // (happens for unauthed resubs like ex-teams)
        return;
      }
      const {asyncIterator} = subscriptionContext;
      asyncIterator.return();
      delete socket.subs[opId];
    });
    socket.on('disconnect', async () => {
      graphQLHandler({query: `
        mutation DisconnectSocket {
          disconnectSocket
        }
      `});
      unsubscribeRelaySub(socket);
    });

    // the async part should come last so there isn't a race
    const authToken = socket.getAuthToken();
    const {exp, tms, sub: userId} = authToken;
    const tokenExpiration = fromEpochSeconds(exp);
    const timeLeftOnToken = tokenExpiration - now;
    // if the user was booted from the team, give them a new token
    const {inactive, tms: tmsDB, userOrgs} = await r.table('User').get(userId)
      .update((user) => ({
        inactive: false,
        updatedAt: now,
        lastSeenAt: now,
        connectedSockets: user('connectedSockets').append(socket.id)
      }), {returnChanges: true})('changes')(0)('old_val').default({});

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
