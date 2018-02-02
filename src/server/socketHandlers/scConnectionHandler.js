import {
  GQL_CONNECTION_ACK,
  GQL_CONNECTION_ERROR,
  GQL_CONNECTION_INIT,
  GQL_CONNECTION_TERMINATE,
  GQL_START,
  GQL_STOP,
  NEW_AUTH_TOKEN
} from 'universal/utils/constants';
import shortid from 'shortid';
import {clientSecret as auth0ClientSecret} from 'server/utils/auth0Helpers';
import {verify} from 'jsonwebtoken';
import scGraphQLHandler from 'server/socketHandlers/scGraphQLHandler';
import scRelaySubscribeHandler from 'server/socketHandlers/scRelaySubscribeHandler';
import relayUnsubscribe from 'server/utils/relayUnsubscribe';
import unsubscribeRelaySub from 'server/utils/unsubscribeRelaySub';
import {fromEpochSeconds} from 'server/utils/epochTime';
import {REFRESH_JWT_AFTER} from 'server/utils/serverConstants';
import makeAuthTokenObj from 'server/utils/makeAuthTokenObj';
import encodeAuthTokenObj from 'server/utils/encodeAuthTokenObj';

// we do this otherwise we'd have to blacklist every token that ever got replaced & query that table for each query
const isTmsValid = (tmsFromDB = [], tmsFromToken = []) => {
  if (tmsFromDB.length !== tmsFromToken.length) return false;
  for (let i = 0; i < tmsFromDB.length; i++) {
    if (tmsFromDB[i] !== tmsFromToken[i]) return false;
  }
  return true;
};

const closeUnauthedSocket = (connectionContext) => {
  const {authToken, socket} = connectionContext;
  if (!authToken) {
    /*
     *  Unauthorized (Application-specific ws code. 4 + HTTP equivalent)
     *  The endpoint is terminating the connection because a connection was established without proper
     *  authorization credentials.
     */
    socket.send(JSON.stringify({type: GQL_CONNECTION_ERROR}));
    socket.close(4401);
    return true;
  }
  return false;
};


const handleConnect = async (connectionContext) => {
  const payload = {
    query: `
    mutation ConnectSocket {
      connectSocket {
        tmsDB: tms
      }
    }
  `
  };
  const now = new Date();
  const {payload: result} = await scGraphQLHandler(connectionContext, {payload});
  if (result.errors) {
    closeUnauthedSocket(connectionContext);
    return;
  }
  const {exp, sub, tms} = connectionContext.authToken;
  const tokenExpiration = fromEpochSeconds(exp);
  const timeLeftOnToken = tokenExpiration - now;
  const {data} = result;
  const {connectSocket: {tmsDB}} = data;
  const tmsIsValid = isTmsValid(tmsDB, tms);
  if (timeLeftOnToken < REFRESH_JWT_AFTER || !tmsIsValid) {
    const nextAuthToken = makeAuthTokenObj(sub, tmsDB);
    connectionContext.authToken = nextAuthToken;
    connectionContext.socket.send(JSON.stringify({type: NEW_AUTH_TOKEN, authToken: encodeAuthTokenObj(nextAuthToken)}))
  }
};

const setConnectionAuth = (connectionContent, authToken) => {
  const nextAuthToken = authToken ? verify(authToken, Buffer.from(auth0ClientSecret, 'base64')) : null;
  if (nextAuthToken && (!connectionContent.authToken || connectionContent.authToken.exp > nextAuthToken.exp)) {
    // don't take an old token
    connectionContent.authToken = nextAuthToken;
    handleConnect(connectionContent);
  }
};

const keepAlive = (connectionContext, timeout) => {
  const cancel = setInterval(() => {
    const {socket} = connectionContext;
    if (connectionContext.isAlive === false) {
      clearInterval(cancel);
      // no need to gracefully close if it's dead
      socket.terminate();
    } else {
      connectionContext.isAlive = false;
      socket.ping(socket.onping);
    }
  }, timeout);
};

const handleMessage = (connectionContext) => async (message) => {
  const {socket, subs} = connectionContext;
  // catch raw, non-graphql protocol messages here
  let parsedMessage;
  try {
    parsedMessage = JSON.parse(message);
  } catch (e) {
    /*
     * Invalid frame payload data
     * The endpoint is terminating the connection because a message was received that contained inconsistent data
     * (e.g., non-UTF-8 data within a text message).
     */
    socket.close(1007);
    return;
  }

  const {id: opId, type, payload} = parsedMessage;

  if (type === GQL_CONNECTION_INIT) {
    const {authToken} = payload;
    setConnectionAuth(connectionContext, authToken);
    const socketClosed = closeUnauthedSocket(connectionContext);
    if (socketClosed) return;
    socket.send(JSON.stringify({type: GQL_CONNECTION_ACK}));
  } else {
    const socketClosed = closeUnauthedSocket(connectionContext);
    if (socketClosed) return;
  }

  if (type === GQL_CONNECTION_TERMINATE) {
    socket.terminate();
  } else if (type === GQL_START && payload.query.startsWith('subscription')) {
    scRelaySubscribeHandler(connectionContext, parsedMessage);
  } else if (type === GQL_START) {
    const gqlMessage = await scGraphQLHandler(connectionContext, parsedMessage);
    socket.send(JSON.stringify(gqlMessage));
  } else if (type === GQL_STOP) {
    relayUnsubscribe(subs, opId);
  }
};

const handleDisconnect = (connectionContext) => () => {
  const payload = {
    query: `
    mutation DisconnectSocket {
      disconnectSocket {
        id
      }
    }
  `
  };
  unsubscribeRelaySub(connectionContext);
  scGraphQLHandler(connectionContext, {payload});
};

const handlePong = (connectionContext) => () => {
  connectionContext.isAlive = true;
};

export default function scConnectionHandler(sharedDataLoader) {
  return async function connectionHandler(socket) {
    const connectionContext = {
      authToken: null,
      subs: {},
      availableResubs: [],
      id: shortid.generate(),
      isAlive: true,
      socket,
      sharedDataLoader
    };
    keepAlive(connectionContext, 10000);
    socket.on('pong', handlePong(connectionContext));
    socket.on('message', handleMessage(connectionContext));
    socket.on('close', handleDisconnect(connectionContext));
  }
};
