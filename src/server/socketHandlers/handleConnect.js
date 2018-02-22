import {GQL_CONNECTION_ACK} from 'universal/utils/constants';
import {REFRESH_JWT_AFTER} from 'server/utils/serverConstants';
import sendNewAuthToken from 'server/socketHelpers/sendNewAuthToken';
import wsGraphQLHandler from 'server/socketHandlers/wsGraphQLHandler';
import makeAuthTokenObj from 'server/utils/makeAuthTokenObj';
import {fromEpochSeconds} from 'server/utils/epochTime';
import sendMessage from 'server/socketHelpers/sendMessage';
import packageJSON from '../../../package.json';
import handleDisconnect from 'server/socketHandlers/handleDisconnect';

const APP_VERSION = packageJSON.version;

const isTmsValid = (tmsFromDB = [], tmsFromToken = []) => {
  if (tmsFromDB.length !== tmsFromToken.length) return false;
  for (let i = 0; i < tmsFromDB.length; i++) {
    if (tmsFromDB[i] !== tmsFromToken[i]) return false;
  }
  return true;
};

const sendFreshTokenIfNeeded = (connectionContext, tmsDB) => {
  const now = new Date();
  const {exp, sub, tms} = connectionContext.authToken;
  const tokenExpiration = fromEpochSeconds(exp);
  const timeLeftOnToken = tokenExpiration - now;
  const tmsIsValid = isTmsValid(tmsDB, tms);
  if (timeLeftOnToken < REFRESH_JWT_AFTER || !tmsIsValid) {
    const nextAuthToken = makeAuthTokenObj(sub, tmsDB);
    connectionContext.authToken = nextAuthToken;
    sendNewAuthToken(connectionContext.socket, nextAuthToken);
  }
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

  const result = await wsGraphQLHandler(connectionContext, {payload});
  const {data} = result;
  if (data) {
    const {connectSocket: {tmsDB}} = data;
    sendFreshTokenIfNeeded(connectionContext, tmsDB);
    return true;
  }
  handleDisconnect(connectionContext, {exitCode: 4401})();
  return false;
};

const handleConnect = async (connectionContext) => {
  const {socket} = connectionContext;
  const success = await handleConnectPublish(connectionContext);
  if (success) {
    sendMessage(socket, GQL_CONNECTION_ACK, {version: APP_VERSION});
  }
  return success;
};

export default handleConnect;
