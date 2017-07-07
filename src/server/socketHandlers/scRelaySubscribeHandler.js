import {parse, subscribe} from 'graphql';
import {forAwaitEach} from 'iterall';
import Schema from 'server/graphql/rootSchema';

export default function scRelaySubscribeHandler(exchange, socket) {
  socket.subs = socket.subs || [];
  return async function relaySubscribeHandler(body) {
    const {opId, query, variables} = body;
    const authToken = socket.getAuthToken();
    const context = {authToken};
    const document = parse(query);
    console.log('calling subscribe');
    const asyncIterator = subscribe(Schema, document, {}, context, variables);
    socket.subs[opId] = asyncIterator;
    const iterableCb = (value) => {
      console.log('emitting gqlData', value)
      socket.emit('gqlData', value);
    }
    await forAwaitEach(asyncIterator, iterableCb);
    console.log('kicking out');
    socket.emit('gqlKickout');

  };
}
