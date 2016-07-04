import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLEnumType,
  GraphQLString
} from 'graphql';
import {SCSocket} from 'socketcluster-client';

export const {CLOSED, CONNECTING, OPEN, AUTHENTICATED, UNAUTHENTICATED} = SCSocket;
export const connectionPriority = [CLOSED, UNAUTHENTICATED, CONNECTING, OPEN, AUTHENTICATED];
export const ConnectionStatus = new GraphQLEnumType({
  name: 'ConnectionStatus',
  description: 'The status of the socket connection',
  values: {
    CLOSED: {value: CLOSED},
    CONNECTING: {value: CONNECTING},
    OPEN: {value: OPEN},
    AUTHENTICATED: {value: AUTHENTICATED},
    UNAUTHENTICATED: {value: UNAUTHENTICATED}
  }
});


export const Connection = new GraphQLObjectType({
  name: 'Connection',
  description: 'A socket connection for a team member',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The socket id'},
    userId: {type: new GraphQLNonNull(GraphQLID), description: 'The user id'},
    status: {
      type: ConnectionStatus,
      description: 'the status of the socket connection'
    },
    createdAt: {type: GraphQLString, description: 'The datetime the connection was established'},
  })
});
