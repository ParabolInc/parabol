import relayUnsubscribeAll from 'server/utils/relayUnsubscribeAll';
import wsGraphQLHandler from 'server/socketHandlers/wsGraphQLHandler';

const handleDisconnect = (connectionContext, options = {}) => () => {
  const {exitCode = 1000} = options;
  const payload = {
    query: `
    mutation DisconnectSocket {
      disconnectSocket {
        id
      }
    }
  `
  };
  relayUnsubscribeAll(connectionContext);
  connectionContext.socket.close(exitCode);
  clearInterval(connectionContext.cancelKeepAlive);
  wsGraphQLHandler(connectionContext, {payload});
};

export default handleDisconnect;
