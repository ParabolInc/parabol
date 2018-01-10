import jwtDecode from 'jwt-decode';
import scRelaySubscribeHandler from 'server/socketHandlers/scRelaySubscribeHandler';
import {fromEpochSeconds} from 'server/utils/epochTime';
import {REFRESH_JWT_AFTER} from 'server/utils/serverConstants';
import unsubscribeRelaySub from 'server/utils/unsubscribeRelaySub';
import {GQL_EXEC, GQL_START, GQL_STOP} from 'universal/utils/constants';
import isObject from 'universal/utils/isObject';
import scGraphQLHandler from './scGraphQLHandler';

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
    const now = new Date();
    socket.subs = {};
    socket.availableResubs = [];
    // socket.on('message', message => {
    //   if (message === '#2') return;
    //   console.log('SOCKET SAYS:', message);
    // });
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
    socket.on(GQL_EXEC, graphQLHandler);
    socket.on(GQL_START, relaySubscribeHandler);
    socket.on(GQL_STOP, (opId) => {
      const subscriptionContext = socket.subs[opId];
      if (!subscriptionContext) return;
      const {asyncIterator} = subscriptionContext;
      asyncIterator.return();
      delete socket.subs[opId];
    });
    socket.on('disconnect', () => {
      graphQLHandler({
        query: `
        mutation DisconnectSocket {
          disconnectSocket {
            id
          }
        }
      `
      });
      unsubscribeRelaySub(socket);
    });

    graphQLHandler({
      query: `
        mutation ConnectSocket {
          connectSocket {
            tmsDB: tms
          }
        }
      `
    }, (err, res) => {
      // Ugly callback, will remove when we move away from socketcluster
      const authToken = socket.getAuthToken();
      const {exp, tms} = authToken;
      const tokenExpiration = fromEpochSeconds(exp);
      const timeLeftOnToken = tokenExpiration - now;
      const {data} = res;
      if (data) {
        const {connectSocket: {tmsDB}} = data;
        const tmsIsValid = isTmsValid(tmsDB, tms);
        if (timeLeftOnToken < REFRESH_JWT_AFTER || !tmsIsValid) {
          const newAuthToken = {
            ...authToken,
            tms: tmsDB,
            exp: undefined
          };
          socket.setAuthToken(newAuthToken);
        }
      }
    });
  };
}
