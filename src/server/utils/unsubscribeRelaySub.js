const unsubscribeRelaySub = (connectionContext) => {
  if (connectionContext.subs) {
    const opIds = Object.keys(connectionContext.subs);
    for (let ii = 0; ii < opIds.length; ii++) {
      const opId = opIds[ii];
      const {asyncIterator} = connectionContext.subs[opId];
      if (asyncIterator) {
        asyncIterator.return();
      }
    }
    connectionContext.subs = {};
    // flag all of these as eligible for resubscribing
    connectionContext.availableResubs = opIds;
  }
};

export default unsubscribeRelaySub;
