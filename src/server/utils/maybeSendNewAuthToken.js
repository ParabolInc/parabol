import jwtDecode from 'jwt-decode';
import sendNewAuthToken from 'server/socketHelpers/sendNewAuthToken';

const setSocketAuth = (connectionContext, authTokenStr) => {
  let newAuthToken;
  try {
    newAuthToken = jwtDecode(authTokenStr);
  } catch (e) {
    // someone tried to be tricky & aliased a request with this name. fail silently, they don't deserve an error
    return;
  }
  connectionContext.authToken = newAuthToken;
  sendNewAuthToken(connectionContext.socket, newAuthToken);
};

const maybeSendNewAuthToken = (connectionContext, result) => {
  const {data} = result;
  if (data && data.newAuthToken) {
    setSocketAuth(connectionContext, data.newAuthToken);
    return true;
  }
  return false;
};

export default maybeSendNewAuthToken;
