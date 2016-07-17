import {graphql} from 'graphql';
import scSubscribeHandler from './scSubscribeHandler';
import scUnsubscribeHandler from './scUnsubscribeHandler';
import scGraphQLHandler from './scGraphQLHandler';

export default function scConnectionHandler(exchange) {
  return async function connectionHandler(socket) {
    const subscribeHandler = scSubscribeHandler(exchange, socket);
    const unsubscribeHandler = scUnsubscribeHandler(exchange, socket);
    const graphQLHandler = scGraphQLHandler(exchange, socket);
    // socket.on('message', message => {
    //   if (message === '#2') return;
    //   console.log('SOCKET SAYS:', message);
    // });
    socket.on('graphql', graphQLHandler);
    socket.on('subscribe', subscribeHandler);
    socket.on('unsubscribe', unsubscribeHandler);
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  };
}
