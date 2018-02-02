const relayUnsubscribe = (subs, opId) => {
  const subscriptionContext = subs[opId];
  if (!subscriptionContext) return;
  const {asyncIterator} = subscriptionContext;
  if (asyncIterator) {
    asyncIterator.return();
  }
  delete subs[opId];
};

export default relayUnsubscribe;
