import {GQL_CONNECTION_ERROR} from 'universal/utils/constants';
import sendMessage from 'server/socketHelpers/sendMessage';

const closeUnauthedSocket = (connectionContext) => {
  const {authToken, socket} = connectionContext;
  if (!authToken) {
    /*
     *  Unauthorized (Application-specific ws code. 4 + HTTP equivalent)
     *  The endpoint is terminating the connection because a connection was established without proper
     *  authorization credentials.
     */
    sendMessage(socket, GQL_CONNECTION_ERROR);
    socket.close(4401);
    return true;
  }
  return false;
};

export default closeUnauthedSocket;
