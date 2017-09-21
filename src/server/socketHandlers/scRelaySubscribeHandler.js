import {parse, subscribe} from 'graphql';
import {forAwaitEach} from 'iterall';
import Schema from 'server/graphql/rootSchema';
import handleGraphQLResult from 'server/utils/handleGraphQLResult';

export default function scRelaySubscribeHandler(socket) {
  socket.subs = socket.subs || [];
  return async function relaySubscribeHandler(body) {
    const {opId, query, variables} = body;
    const authToken = socket.getAuthToken();
    const context = {authToken, socketId: socket.id};
    const document = parse(query);
    const asyncIterator = subscribe(Schema, document, {}, context, variables);
    socket.subs[opId] = asyncIterator;
    const iterableCb = (value) => {
      const changedAuth = handleGraphQLResult(value, socket);
      socket.emit(`gqlData.${opId}`, value);
      if (changedAuth) {
        // end the notification subscription. the client will start a new one with an updated tms
        setTimeout(() => asyncIterator.return());
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
    socket.emit(`gqlData.${opId}`);
  };
}
