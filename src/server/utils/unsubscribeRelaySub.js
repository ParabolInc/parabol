const unsubscribeRelaySub = (subs = [], opId) => {
  if (subs[opId]) {
    console.log('unsubbing from', opId);
    subs[opId].return();
    delete subs[opId];
  }
};

export default unsubscribeRelaySub;
