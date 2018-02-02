import jwtDecode from 'jwt-decode';
import {NEW_AUTH_TOKEN} from 'universal/utils/constants';

const setSocketAuth = (connectionContext, authTokenStr) => {
  let newAuthToken;
  try {
    newAuthToken = jwtDecode(authTokenStr);
  } catch (e) {
    // someone tried to be tricky & aliased a request with this name. fail silently, they don't deserve an error
    return;
  }
  connectionContext.authToken = newAuthToken;
  connectionContext.socket.send(JSON.stringify({type: NEW_AUTH_TOKEN, authToken: authTokenStr}))
};

const handleGraphQLResult = (connectionContext, result) => {
  const {data} = result;
  if (data && data.newAuthToken) {
    setSocketAuth(connectionContext, data.newAuthToken);
    return true;
  }
  return false;
};

export default handleGraphQLResult;
