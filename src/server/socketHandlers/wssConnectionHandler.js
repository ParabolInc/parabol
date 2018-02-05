import shortid from 'shortid';
import keepAlive from 'server/socketHelpers/keepAlive';
import handleDisconnect from 'server/socketHandlers/handleDisconnect';
import handleMessage from 'server/socketHandlers/handleMessage';

class ConnectionContext {
  constructor(socket, sharedDataLoader) {
    this.authToken = null;
    this.availableResubs = [];
    this.cancelKeepAlive = null;
    this.id = shortid.generate();
    this.isAlive = true;
    this.socket = socket;
    this.sharedDataLoader = sharedDataLoader;
    this.subs = {};
  }
}

export default function connectionHandler(sharedDataLoader) {
  return async function socketConnectionHandler(socket) {
    const connectionContext = new ConnectionContext(socket, sharedDataLoader);
    keepAlive(connectionContext, 10000);
    socket.on('pong', () => {
      connectionContext.isAlive = true;
    });
    socket.on('message', handleMessage(connectionContext));
    socket.on('close', handleDisconnect(connectionContext));
  };
}
