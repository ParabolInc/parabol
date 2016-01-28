
export default function onConnection(io, socket) {
  // When a user connects, stick the socket in the user's session:
  const { session } = socket.handshake;
  session.sockets = session.sockets || [];
  session.sockets.push(socket.id);
  session.save();

  socket.emit('msg', `'Hello World!' from server`);

  socket.on('join', (room, cb) => {
    socket.join(room);
    cb(true);
  });

  socket.on('leave', (room, cb) => {
    socket.leave(room);
    cb(true);
  });
}
