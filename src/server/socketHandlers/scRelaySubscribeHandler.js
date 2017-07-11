import {parse, subscribe} from 'graphql';
import {forAwaitEach} from 'iterall';
import Schema from 'server/graphql/rootSchema';

export default function scRelaySubscribeHandler(exchange, socket) {
  socket.subs = socket.subs || [];
  return async function relaySubscribeHandler(body) {
    const {opId, query, variables} = body;
    const authToken = socket.getAuthToken();
    const context = {authToken, socketId: socket.id};
    const document = parse(query);
    const asyncIterator = subscribe(Schema, document, {}, context, variables);
    socket.subs[opId] = asyncIterator;
    const iterableCb = (value) => {
      socket.emit(`gqlData.${opId}`, value);
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
