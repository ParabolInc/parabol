import shortid from 'shortid';
import keepAlive from 'server/socketHelpers/keepAlive';
import handleDisconnect from 'server/socketHandlers/handleDisconnect';
import handleMessage from 'server/socketHandlers/handleMessage';

const makeConnectionContext = (socket, sharedDataLoader) => ({
  authToken: null,
  subs: {},
  availableResubs: [],
  id: shortid.generate(),
  isAlive: true,
  socket,
  sharedDataLoader
});

export default function connectionHandler(sharedDataLoader) {
  return async function socketConnectionHandler(socket) {
    const connectionContext = makeConnectionContext(socket, sharedDataLoader);
    keepAlive(connectionContext, 10000);
    socket.on('pong', () => {
      connectionContext.isAlive = true;
    });
    socket.on('message', handleMessage(connectionContext));
    socket.on('close', handleDisconnect(connectionContext));
  };
}
