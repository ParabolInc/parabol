const unsubscribeRelaySub = (socket, sharedDataloader) => {
  if (socket.subs) {
    const keys = Object.keys(socket.subs);
    for (let ii = 0; ii < keys.length; ii++) {
      const key = keys[ii];
      const val = socket.subs[key];
      val.asyncIterator.return();
      sharedDataloader.dispose(key, {force: true});
    }
    socket.subs = {};
  }
};

export default unsubscribeRelaySub;
