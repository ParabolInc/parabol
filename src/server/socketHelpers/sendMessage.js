const sendMessage = (socket, type, payload, opId) => {
  const message = {type};
  if (payload) message.payload = payload;
  if (opId) message.id = opId;
  socket.send(JSON.stringify(message));
};

export default sendMessage;
