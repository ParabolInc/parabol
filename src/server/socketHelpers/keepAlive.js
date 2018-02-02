import handleDisconnect from 'server/socketHandlers/handleDisconnect';

const keepAlive = (connectionContext, timeout) => {
  const cancel = setInterval(() => {
    const {socket} = connectionContext;
    if (connectionContext.isAlive === false) {
      clearInterval(cancel);
      handleDisconnect(connectionContext)();
      // no need to gracefully close if it's dead
      socket.terminate();
    } else {
      connectionContext.isAlive = false;
      socket.ping(socket.onping);
    }
  }, timeout);
  return cancel;
};

export default keepAlive;
