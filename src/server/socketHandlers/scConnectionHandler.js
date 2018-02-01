import jwtDecode from 'jwt-decode';
import {GQL_CONNECTION_ACK, GQL_CONNECTION_INIT, GQL_EXEC} from 'universal/utils/constants';
import isObject from 'universal/utils/isObject';
import shortid from 'shortid';

// we do this otherwise we'd have to blacklist every token that ever got replaced & query that table for each query
const isTmsValid = (tmsFromDB = [], tmsFromToken = []) => {
  if (tmsFromDB.length !== tmsFromToken.length) return false;
  for (let i = 0; i < tmsFromDB.length; i++) {
    if (tmsFromDB[i] !== tmsFromToken[i]) return false;
  }
  return true;
};

const keepAlive = (connectionContext, timeout) => setInterval(() => {
  if (connectionContext.isAlive === false) {
    clearInterval(keepAlive);
    connectionContext.socket.terminate();
  } else {
    connectionContext.isAlive = false;
    connectionContext.socket.ping(connectionContext.socket.onping);
  }
}, timeout);

export default function scConnectionHandler(sharedDataLoader) {
  return async function connectionHandler(socket, req) {
    console.log('connected', socket);
    const now = new Date();
    const connectionContext = {
      subs: {},
      availableResubs: [],
      id: shortid.generate(),
      isAlive: true,
      socket
    };
    socket.on('pong', () => {
      connectionContext.isAlive = true;
    });
    keepAlive(connectionContext, 10000);

    // const graphQLHandler = scGraphQLHandler(socket, sharedDataLoader);
    // const relaySubscribeHandler = scRelaySubscribeHandler(socket, sharedDataLoader);
    socket.on('message', (message) => {
      // catch raw, non-graphql protocol messages here
      let messageJSON;
      try {
        messageJSON = JSON.parse(message);
      } catch (e) {
        // this did not come from the client. fail silently
        console.error('bad message received', message);
        return;
      }
      const {id, type, payload} = messageJSON;

      console.log('json', id, type);
      if (type === GQL_CONNECTION_INIT) {
        const {authToken} = payload;
        if (!authToken) {
          console.error('no auth token provided by the client');
          return;
        }
        socket.authToken = authToken;
        socket.send(JSON.stringify({type: GQL_CONNECTION_ACK}));
      }
      console.log('calling pong');

      // if someone tries to replace their server-provided token with an older one that gives access to more teams, exit
      if (isObject(message) && message.event === '#authenticate') {
        const decodedToken = jwtDecode(message.data);
        const serverToken = socket.getAuthToken();
        if (decodedToken.exp < serverToken.exp) {
          socket.disconnect(4501, 'naughty nelly');
        }
      }
    });
    // socket.on(GQL_EXEC, graphQLHandler);
    // socket.on(GQL_START, relaySubscribeHandler);
    // socket.on(GQL_STOP, (opId) => {
    //   const subscriptionContext = socket.subs[opId];
    //   if (!subscriptionContext) return;
    //   const {asyncIterator} = subscriptionContext;
    //   asyncIterator.return();
    //   delete socket.subs[opId];
    // });
    // socket.on('disconnect', () => {
    //   graphQLHandler({
    //     query: `
    //     mutation DisconnectSocket {
    //       disconnectSocket {
    //         id
    //       }
    //     }
    //   `
    //   });
    //   unsubscribeRelaySub(socket);
    // });
    //
    // graphQLHandler({
    //   query: `
    //     mutation ConnectSocket {
    //       connectSocket {
    //         tmsDB: tms
    //       }
    //     }
    //   `
    // }, (err, res) => {
    //   // Ugly callback, will remove when we move away from socketcluster
    //   const authToken = socket.getAuthToken();
    //   const {exp, tms} = authToken;
    //   const tokenExpiration = fromEpochSeconds(exp);
    //   const timeLeftOnToken = tokenExpiration - now;
    //   const {data} = res;
    //   if (data) {
    //     const {connectSocket: {tmsDB}} = data;
    //     const tmsIsValid = isTmsValid(tmsDB, tms);
    //     if (timeLeftOnToken < REFRESH_JWT_AFTER || !tmsIsValid) {
    //       const newAuthToken = {
    //         ...authToken,
    //         tms: tmsDB,
    //         exp: undefined
    //       };
    //       socket.setAuthToken(newAuthToken);
    //     }
    //   }
    // });
  };
}
