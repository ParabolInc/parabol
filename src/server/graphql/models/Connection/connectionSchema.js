import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLEnumType
} from 'graphql';
import {SCSocket} from 'socketcluster-client';

const {CLOSED, CONNECTING, OPEN, AUTHENTICATED, PENDING, UNAUTHENTICATED} = SCSocket;
export const connectionPriority = [CLOSED, UNAUTHENTICATED, CONNECTING, PENDING, OPEN, AUTHENTICATED];
export const ConnectionStatus = new GraphQLEnumType({
  name: "ConnectionStatus",
  description: "The status of the socket connection",
  values: {
    CLOSED: {value: CLOSED},
    CONNECTING: {value: CONNECTING},
    OPEN: {value: OPEN},
    AUTHENTICATED: {value: AUTHENTICATED},
    PENDING: {value: PENDING},
    UNAUTHENTICATED: {value: UNAUTHENTICATED}
  }
});


export const Connection = new GraphQLObjectType({
  name: 'Connection',
  description: 'A socket connection for a team member',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The socket id'},
    status: {
      type: ConnectionStatus,
      description: 'the status of the socket connection'
    },
    connections: {
      type: new GraphQLList(Connection),
      description: 'The connections (tabs and devices) that the user has had during the meeting'
    },
    createdAt: {type: GraphQLString, description: 'The datetime the connection was established'},
  })
});
