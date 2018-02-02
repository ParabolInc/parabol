import unsubscribeRelaySub from 'server/utils/unsubscribeRelaySub';
import wsGraphQLHandler from 'server/socketHandlers/wsGraphQLHandler';

const handleDisconnect = (connectionContext) => () => {
  const payload = {
    query: `
    mutation DisconnectSocket {
      disconnectSocket {
        id
      }
    }
  `
  };
  unsubscribeRelaySub(connectionContext);
  wsGraphQLHandler(connectionContext, {payload});
};

export default handleDisconnect;
