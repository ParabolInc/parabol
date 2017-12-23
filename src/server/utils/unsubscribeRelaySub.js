const unsubscribeRelaySub = (socket) => {
  if (socket.subs) {
    const opIds = Object.keys(socket.subs);
    for (let ii = 0; ii < opIds.length; ii++) {
      const opId = opIds[ii];
      const {asyncIterator} = socket.subs[opId];
      asyncIterator.return();
    }
    socket.subs = {};
    // flag all of these as eligible for resubscribing
    socket.availableResubs = opIds;
  }
};

export default unsubscribeRelaySub;
