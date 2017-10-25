import jwtDecode from 'jwt-decode';

const setSocketAuth = (socket, authTokenStr) => {
  let newAuthToken;
  try {
    newAuthToken = jwtDecode(authTokenStr);
  } catch (e) {
    // someone tried to be tricky & aliased a request with this name. fail silently, they don't deserve an error
    return;
  }
  socket.setAuthToken({
    ...socket.getAuthToken(),
    ...newAuthToken,
    exp: undefined
  });
};

const handleGraphQLResult = (result, socket) => {
  const {data} = result;
  if (data && data.newAuthToken) {
    setSocketAuth(socket, data.newAuthToken);
    return true;
  }
  return false;
};

export default handleGraphQLResult;
