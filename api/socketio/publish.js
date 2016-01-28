
export const EVENT = 'publish';
export const MODEL = 'model';
export const OPERATION = 'operation';
export const INSERT = 'INSERT';
export const UPDATE = 'UPDATE';
export const DELETE = 'DELETE';

export default function publish(io, room, model, thinkyDoc,
                                  sourceSocketId = null) {
  // console.log(`publish into ${room} a doc from ${sourceSocketId}`);
  /*
   * Begin by looking up the socket to originate the message.
   * N.B. client socket ids omit the '/#' so we add it here.
   */
  const socket = io.sockets.connected['/#' + sourceSocketId];

  if (typeof socket === 'undefined') {
    // not our fight (socket should be found on another server instance)
    return;
  }

  const message = {
    [MODEL]: model,
    [OPERATION]: null,
    old_val: null,
    new_val: null,
  };

  if (thinkyDoc.isSaved() === false) {
    message.operation = DELETE;
    message.old_val = thinkyDoc;
  } else if (thinkyDoc.getOldValue() === null) {
    message.operation = INSERT;
    message.new_val = thinkyDoc;
  } else {
    message.operation = UPDATE;
    message.old_val = thinkyDoc.getOldValue();
    message.new_val = thinkyDoc;
  }

  // console.log('MESSAGE: ', JSON.stringify(message, null, 2));

  // Publish!
  socket.broadcast.to(room).emit(EVENT, message);
}
