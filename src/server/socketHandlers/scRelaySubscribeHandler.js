import {parse, subscribe} from 'graphql';
import {forAwaitEach} from 'iterall';
import Schema from 'server/graphql/rootSchema';
import handleGraphQLResult from 'server/utils/handleGraphQLResult';
import RethinkDataLoader from 'server/utils/RethinkDataLoader';
import unsubscribeRelaySub from 'server/utils/unsubscribeRelaySub';
import {GQL_COMPLETE, GQL_DATA, GQL_ERROR} from 'universal/utils/constants';
import relayUnsubscribe from 'server/utils/relayUnsubscribe';

const trySubscribe = async (authToken, parsedMessage, socketId, sharedDataLoader, isResub) => {
  const dataLoader = sharedDataLoader.add(new RethinkDataLoader(authToken, {cache: false}));
  const {payload: {query, variables}} = parsedMessage;
  const context = {authToken, dataLoader, socketId};
  const document = parse(query);
  try {
    const result = await subscribe(Schema, document, {}, context, variables);
    if (!result.errors || !isResub) return result;
    // squelch errors for resub, we expect a few errors & the client doesn't need to know about them
    // failing here means the subscription failed our custom business logic in the subscribe method
  } catch (e) {
    // the subscription couldn't be found or there was an internal graphql error
    return {errors: [{message: e.message}]};
  }
  return undefined;
};

export default function scRelaySubscribeHandler(connectionContext, parsedMessage) {
  const {id: socketId, availableResubs, authToken, socket, sharedDataLoader, subs} = connectionContext;
  const {id: opId} = parsedMessage;
  subs[opId] = {status: 'pending'};
  const handleSubscribe = async (options = {}) => {
    const isResub = options;
    if (subs[opId]) {
      // subscription already exists, restart it
      relayUnsubscribe(subs, opId);
    }

    const asyncIterator = await trySubscribe(authToken, parsedMessage, socketId, sharedDataLoader, isResub);
    if (!asyncIterator) return;

    subs[opId] = {
      asyncIterator
    };
    const iterableCb = (payload) => {
      const changedAuth = handleGraphQLResult(connectionContext, payload);
      if (changedAuth) {
        // if auth changed, then we can't trust any of the subscriptions, so dump em all and resub for the client
        // delay it to guarantee that no matter when this is published, it is the last message on the mutation
        setTimeout(() => unsubscribeRelaySub(socket), 1000);
        return;
      }
      const message = {
        id: opId,
        type: payload.errors ? GQL_ERROR : GQL_DATA,
        payload
      };
      socket.send(JSON.stringify(message));
    };

    // Use this to kick clients out of the sub
    // setTimeout(() => {
    //  asyncIterator.return();
    //  console.log('sub ended', opId)
    // }, 5000)
    await forAwaitEach(asyncIterator, iterableCb);
    const resubIdx = availableResubs.indexOf(opId);
    if (resubIdx !== -1) {
      // reinitialize the subscription
      handleSubscribe({isResub: true});
      availableResubs.splice(resubIdx, 1);
    } else {
      socket.send(JSON.stringify({id: opId, type: GQL_COMPLETE}));
    }
  };
  handleSubscribe();
}
