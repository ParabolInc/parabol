import {graphql} from 'graphql';
import Schema from './graphql/rootSchema';
import {addConnectionString} from './graphql/models/Connection/queryStrings';
import {wsGraphQLHandler, wsGraphQLSubHandler} from './graphql/wsGraphQLHandlers';

export default async socket => {
  const authTokenObj = socket.getAuthToken();
  const variables = {
    userId: authTokenObj.sub,
    socketId: socket.id
  };
  // console.log('Client connected:', socket.id);
  // console.log('toke', socket.getAuthToken());
  const isConnectionWritten = await graphql(Schema, addConnectionString, null, {authToken: authTokenObj}, variables);
  console.log('connection written', isConnectionWritten);
  socket.on('graphql', wsGraphQLHandler);
  socket.on('subscribe', wsGraphQLSubHandler);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  });
};
