import {parse, subscribe} from 'graphql';
import {forAwaitEach} from 'iterall';
import Schema from 'server/graphql/rootSchema';
import handleGraphQLResult from 'server/utils/handleGraphQLResult';
import RethinkDataLoader from 'server/utils/RethinkDataLoader';
import unsubscribeRelaySub from 'server/utils/unsubscribeRelaySub';

const trySubscribe = async (authToken, body, socket, getDataLoader) => {
  const {opId, query, variables} = body;
  const context = {authToken, getDataLoader, socketId: socket.id};
  const document = parse(query);
  const responseChannel = `gqlData.${opId}`;
  try {
    const result = await subscribe(Schema, document, {}, context, variables);
    if (!result.errors) return result;
    socket.emit(responseChannel, result);
  } catch (e) {
    const errorObj = {message: e.message};
    const payload = {errors: [errorObj]};
    socket.emit(responseChannel, payload);
  }
  return undefined;
};

export default function scRelaySubscribeHandler(socket, sharedDataLoader) {
  socket.subs = socket.subs || {};
  return async function relaySubscribeHandler(body) {
    const authToken = socket.getAuthToken();
    const getDataLoader = sharedDataLoader.add(new RethinkDataLoader(authToken, {cache: false}));
    const dataLoader = getDataLoader();
    const asyncIterator = await trySubscribe(authToken, body, socket, getDataLoader);
    if (!asyncIterator) return;
    const {opId} = body;
    const responseChannel = `gqlData.${opId}`;

    socket.subs[opId] = {
      asyncIterator,
      // we don't want it to use the mutation version of dataloader, so grab it here
      dataLoader
    };
    const iterableCb = (value) => {
      const changedAuth = handleGraphQLResult(value, socket);
      if (changedAuth) {
        // if auth changed, then we can't trust any of the subscriptions, so dump em all. The client will resub with new auth

        setTimeout(() => {
          unsubscribeRelaySub(socket);
        }, 300);
      } else {
        // we already sent a new authToken, no need to emit the gql response
        socket.emit(responseChannel, value);
      }
    };

    // Use this to kick clients out of the sub
    // setTimeout(() => {
    //  asyncIterator.return();
    //  console.log('sub ended', opId)
    // }, 5000)
    await forAwaitEach(asyncIterator, iterableCb);
    /*
     * tell the client it won't receive any more messages for that op
     * if the client initiated the unsub, then it'll have stopped listening before this is sent
     *
     */
    socket.emit(responseChannel);
  };
}
