import scSubscribeHandler from './scSubscribeHandler';
import scUnsubscribeHandler from './scUnsubscribeHandler';
import scGraphQLHandler from './scGraphQLHandler';
import {REFRESH_JWT_AFTER} from 'server/utils/serverConstants';

export default function scConnectionHandler(exchange) {
  return async function connectionHandler(socket) {
    const authToken = socket.getAuthToken();
    const now = new Date();
    const tokenExpiration = new Date(authToken.exp * 1000);
    const timeLeftOnToken = tokenExpiration - now;
    if (timeLeftOnToken < REFRESH_JWT_AFTER) {
      socket.setAuthToken(authToken);
    }
    const subscribeHandler = scSubscribeHandler(exchange, socket);
    const unsubscribeHandler = scUnsubscribeHandler(exchange, socket);
    const graphQLHandler = scGraphQLHandler(exchange, socket);
    // socket.on('message', message => {
      // if (message === '#2') return;
      // console.log('SOCKET SAYS:', message);
    // });
    socket.on('graphql', graphQLHandler);
    socket.on('subscribe', subscribeHandler);
    socket.on('unsubscribe', unsubscribeHandler);
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  };
}
