import handleDisconnect from 'server/socketHandlers/handleDisconnect';
import {GQL_CONNECTION_KEEP_ALIVE} from 'universal/utils/constants';

const keepAlive = (connectionContext, timeout) => {
  connectionContext.cancelKeepAlive = setInterval(() => {
    const {socket} = connectionContext;
    if (connectionContext.isAlive === false) {
      handleDisconnect(connectionContext)();
    } else {
      connectionContext.isAlive = false;
      socket.send(GQL_CONNECTION_KEEP_ALIVE);
    }
  }, timeout);
};

export default keepAlive;
