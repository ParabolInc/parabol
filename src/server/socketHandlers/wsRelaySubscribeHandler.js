import {parse, subscribe} from 'graphql';
import {forAwaitEach} from 'iterall';
import Schema from 'server/graphql/rootSchema';
import maybeSendNewAuthToken from 'server/utils/maybeSendNewAuthToken';
import RethinkDataLoader from 'server/utils/RethinkDataLoader';
import relayUnsubscribeAll from 'server/utils/relayUnsubscribeAll';
import {GQL_COMPLETE, GQL_DATA, GQL_ERROR} from 'universal/utils/constants';
import relayUnsubscribe from 'server/utils/relayUnsubscribe';
import sendMessage from 'server/socketHelpers/sendMessage';
import sendGraphQLErrorResult from 'server/utils/sendGraphQLErrorResult';
import firstErrorMessage from 'universal/utils/relay/firstErrorMessage';

const trySubscribe = async (authToken, parsedMessage, socketId, sharedDataLoader, isResub) => {
  const dataLoader = sharedDataLoader.add(new RethinkDataLoader(authToken, {cache: false}));
  const {payload: {query, variables}} = parsedMessage;
  const context = {authToken, dataLoader, socketId};
  const document = parse(query);
  try {
    const result = await subscribe(Schema, document, {}, context, variables);
    // failing here means the subscription failed our custom business logic in the subscribe method, eg bad auth
    if (!result.errors) {
      return {asyncIterator: result};
    }
    // squelch errors for resub, we expect a few errors & the client doesn't need to know about them
    return isResub ? {} : {errors: result.errors};
  } catch (e) {
    // the subscription couldn't be found or there was an internal graphql error
    return {errors: [{message: e.message}]};
  }
};

const handleSubscribe = async (connectionContext, parsedMessage, options = {}) => {
  const {id: socketId, authToken, socket, sharedDataLoader} = connectionContext;
  const {id: opId} = parsedMessage;
  const isResub = options;
  if (connectionContext.subs[opId]) {
    // subscription already exists, restart it
    relayUnsubscribe(connectionContext.subs, opId);
  }

  connectionContext.subs[opId] = {status: 'pending'};
  const {asyncIterator, errors} = await trySubscribe(authToken, parsedMessage, socketId, sharedDataLoader, isResub);
  if (!asyncIterator) {
    if (errors) {
      const {query, variables} = parsedMessage;
      sendGraphQLErrorResult('WebSocket-Subscription', firstErrorMessage(errors), query, variables, authToken);
      sendMessage(socket, GQL_ERROR, {errors}, opId);
    }
    return;
  }
  connectionContext.subs[opId] = {
    asyncIterator
  };
  const iterableCb = (payload) => {
    const changedAuth = maybeSendNewAuthToken(connectionContext, payload);
    if (changedAuth) {
      // if auth changed, then we can't trust any of the subscriptions, so dump em all and resub for the client
      // delay it to guarantee that no matter when this is published, it is the last message on the mutation
      setTimeout(() => relayUnsubscribeAll(connectionContext, {isResub: true}), 1000);
      return;
    }
    sendMessage(socket, GQL_DATA, payload, opId);
  };

  // Use this to kick clients out of the sub
  // setTimeout(() => {
  //  asyncIterator.return();
  //  console.log('sub ended', opId)
  // }, 5000)
  await forAwaitEach(asyncIterator, iterableCb);
  const resubIdx = connectionContext.availableResubs.indexOf(opId);
  if (resubIdx !== -1) {
    // reinitialize the subscription
    handleSubscribe(connectionContext, parsedMessage, {isResub: true});
    connectionContext.availableResubs.splice(resubIdx, 1);
  } else {
    sendMessage(socket, GQL_COMPLETE, undefined, opId);
  }
};

export default function wsRelaySubscribeHandler(connectionContext, parsedMessage) {
  handleSubscribe(connectionContext, parsedMessage);
}
