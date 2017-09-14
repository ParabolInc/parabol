import jwtDecode from 'jwt-decode';

const setSocketAuth = (socket, authTokenStr) => {
  socket.setAuthToken({
    ...jwtDecode(authTokenStr),
    exp: undefined
  });
};

const handleGraphQLResult = (result, socket) => {
  const {data, errors} = result;
  if (errors) return result;
  if (data.notificationsAdded) {
    const {notifications} = data.notificationsAdded;
    const updateTokenNotification = notifications.find((notification) => notification.authToken);
    if (updateTokenNotification) {
      setSocketAuth(socket, updateTokenNotification.authToken);
    }
  } else if (data.acceptTeamInviteNotification) {
    setSocketAuth(socket, data.acceptTeamInviteNotification.authToken);
  }
  return result;
};

export default handleGraphQLResult;
