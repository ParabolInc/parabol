import jwtDecode from 'jwt-decode';

const setSocketAuth = (socket, authTokenStr) => {
  socket.setAuthToken({
    ...jwtDecode(authTokenStr),
    exp: undefined
  });
};

const handleGraphQLResult = (result, socket) => {
  const {data} = result;
  if (data.notificationsAdded) {
    const {notifications} = data.notificationsAdded;
    const updateTokenNotification = notifications.find((notification) => notification.authToken);
    if (updateTokenNotification) {
      setSocketAuth(socket, updateTokenNotification.authToken);
    }
  } else if (data.acceptTeamInvite) {
    setSocketAuth(socket, data.acceptTeamInvite.authToken);
  }
  return result;
};

export default handleGraphQLResult;
