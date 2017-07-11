const composeSubs = (...subs) => () => subs.forEach((unsub) => unsub());

export default composeSubs;
