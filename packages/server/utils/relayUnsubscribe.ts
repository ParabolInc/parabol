const relayUnsubscribe = (subs: string[], opId: string) => {
  const subscriptionContext = subs && subs[opId]
  if (!subscriptionContext) return
  const {asyncIterator} = subscriptionContext
  if (asyncIterator) {
    asyncIterator.return()
  }
  delete subs[opId]
}

export default relayUnsubscribe
