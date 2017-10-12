import jwtDecode from 'jwt-decode';

const setSocketAuth = (socket, authTokenStr) => {
  socket.setAuthToken({
    ...jwtDecode(authTokenStr),
    exp: undefined
  });
};

const handleGraphQLResult = (result, socket) => {
  const {data, errors} = result;
  if (errors) return false;
  if (data.notificationsAdded) {
    const {notifications} = data.notificationsAdded;
    const updateTokenNotification = notifications.find((notification) => notification.authToken);
    if (updateTokenNotification) {
      setSocketAuth(socket, updateTokenNotification.authToken);
      return true;
    }
  } else if (data.acceptTeamInviteNotification) {
    setSocketAuth(socket, data.acceptTeamInviteNotification.authToken);
    return true;
  } else if (data.newAuthToken) {
    // TODO refactor the above 2 clauses so this is the only one
    setSocketAuth(socket, data.newAuthToken);
    return true;
  }
  return false;
};

export default handleGraphQLResult;
