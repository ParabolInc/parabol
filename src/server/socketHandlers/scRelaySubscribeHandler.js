import {parse, subscribe} from 'graphql';
import {forAwaitEach} from 'iterall';
import Schema from 'server/graphql/rootSchema';
import handleGraphQLResult from 'server/utils/handleGraphQLResult';
import RethinkDataLoader from 'server/utils/RethinkDataLoader';
import unsubscribeRelaySub from 'server/utils/unsubscribeRelaySub';
import {GQL_COMPLETE, GQL_DATA, GQL_ERROR} from 'universal/utils/constants';

const trySubscribe = async (authToken, body, socket, sharedDataLoader, isResub) => {
  const dataLoader = sharedDataLoader.add(new RethinkDataLoader(authToken, {cache: false}));
  const {opId, query, variables} = body;
  const context = {authToken, dataLoader, socketId: socket.id};
  const document = parse(query);
  try {
    const result = await subscribe(Schema, document, {}, context, variables);
    if (!result.errors) return result;
    // squelch errors for resub, we expect a few errors & the client doesn't need to know about them
    if (!isResub) {
      // the supplied request failed our auth business logic
      const message = {
        opId,
        payload: result
      };
      socket.emit(GQL_ERROR, message);
    }
  } catch (e) {
    // the subscription couldn't be found or there was an internal graphql error
    const errorObj = {message: e.message};
    const message = {
      opId,
      payload: {errors: [errorObj]}
    };
    socket.emit(GQL_ERROR, message);
  }
  return undefined;
};

export default function scRelaySubscribeHandler(socket, sharedDataLoader) {
  return function relaySubscribeHandler(body) {
    const handleSubscribe = async (options = {}) => {
      const isResub = options;
      const authToken = socket.getAuthToken();
      const asyncIterator = await trySubscribe(authToken, body, socket, sharedDataLoader, isResub);
      if (!asyncIterator) return;
      // node coerces things that look like numbres, but this will be the key for the subs object, and keys are strings
      const opId = String(body.opId);

      socket.subs[opId] = {
        asyncIterator
      };
      const iterableCb = (payload) => {
        const changedAuth = handleGraphQLResult(payload, socket);
        if (changedAuth) {
          // if auth changed, then we can't trust any of the subscriptions, so dump em all and resub for the client
          // delay it to guarantee that no matter when this is published, it is the last message on the mutation
          setTimeout(() => unsubscribeRelaySub(socket), 1000);
        } else {
          // we already sent a new authToken, no need to emit the gql response
          const message = {opId, payload};
          socket.emit(GQL_DATA, message);
        }
      };

      // Use this to kick clients out of the sub
      // setTimeout(() => {
      //  asyncIterator.return();
      //  console.log('sub ended', opId)
      // }, 5000)
      await forAwaitEach(asyncIterator, iterableCb);
      const resubIdx = socket.availableResubs.indexOf(opId);
      if (resubIdx !== -1) {
        // reinitialize the subscription
        handleSubscribe({isResub: true});
        socket.availableResubs.splice(resubIdx, 1);
      } else {
        socket.emit(GQL_COMPLETE, {opId});
      }
    };
    handleSubscribe();
  };
}
