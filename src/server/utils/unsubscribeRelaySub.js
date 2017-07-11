const unsubscribeRelaySub = (subs = [], opId) => {
  if (subs[opId]) {
    subs[opId].return();
    delete subs[opId];
  }
};

export default unsubscribeRelaySub;
