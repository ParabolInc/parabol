import {GQL_CONNECTION_ACK} from 'universal/utils/constants';
import closeUnauthedSocket from 'server/socketHelpers/closeUnauthedSocket';
import {clientSecret as auth0ClientSecret} from 'server/utils/auth0Helpers';
import {verify} from 'jsonwebtoken';
import {REFRESH_JWT_AFTER} from 'server/utils/serverConstants';
import sendNewAuthToken from 'server/socketHelpers/sendNewAuthToken';
import wsGraphQLHandler from 'server/socketHandlers/wsGraphQLHandler';
import makeAuthTokenObj from 'server/utils/makeAuthTokenObj';
import {fromEpochSeconds} from 'server/utils/epochTime';
import sendMessage from 'server/socketHelpers/sendMessage';

const isTmsValid = (tmsFromDB = [], tmsFromToken = []) => {
  if (tmsFromDB.length !== tmsFromToken.length) return false;
  for (let i = 0; i < tmsFromDB.length; i++) {
    if (tmsFromDB[i] !== tmsFromToken[i]) return false;
  }
  return true;
};

const handleConnectPublish = async (connectionContext) => {
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
  const result = await wsGraphQLHandler(connectionContext, {payload});
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
    sendNewAuthToken(connectionContext.socket, nextAuthToken);
  }
};

const setConnectionAuth = (connectionContent, authToken) => {
  const nextAuthToken = authToken ? verify(authToken, Buffer.from(auth0ClientSecret, 'base64')) : null;
  if (nextAuthToken && (!connectionContent.authToken || connectionContent.authToken.exp > nextAuthToken.exp)) {
    // don't take an old token
    connectionContent.authToken = nextAuthToken;
    handleConnectPublish(connectionContent);
  }
};

const handleConnect = (connectionContext, payload) => {
  const {socket} = connectionContext;
  const {authToken} = payload;
  setConnectionAuth(connectionContext, authToken);
  const socketClosed = closeUnauthedSocket(connectionContext);
  if (socketClosed) return;
  sendMessage(socket, GQL_CONNECTION_ACK);
};

export default handleConnect;
