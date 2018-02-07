import handleDisconnect from 'server/socketHandlers/handleDisconnect';

const keepAlive = (connectionContext, timeout) => {
  connectionContext.socket.on('pong', () => {
    connectionContext.isAlive = true;
  });
  connectionContext.cancelKeepAlive = setInterval(() => {
    const {socket} = connectionContext;
    if (connectionContext.isAlive === false) {
      handleDisconnect(connectionContext)();
    } else {
      connectionContext.isAlive = false;
      socket.ping(socket.onping);
    }
  }, timeout);
};

export default keepAlive;
