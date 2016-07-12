import {graphql} from 'graphql';
import {wsGraphQLHandler, wsGraphQLSubHandler} from './graphql/wsGraphQLHandlers';

export default async socket => {
  const authTokenObj = socket.getAuthToken();
  const variables = {
    userId: authTokenObj.sub,
    socketId: socket.id
  };
  socket.on('message', message => {
    if (message === '#2') return;
    console.log('SOCKET:', message);
  });
  socket.on('graphql', wsGraphQLHandler);
  socket.on('subscribe', wsGraphQLSubHandler);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  });
};
