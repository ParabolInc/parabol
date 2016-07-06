import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID
} from 'graphql';
import {Connection, ConnectionStatus, connectionPriority, CLOSED} from '../Connection/connectionSchema';

export const Participant = new GraphQLObjectType({
  name: 'Participant',
  description: 'A team member that attended the team meeting',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The participant\'s cachedUserId'},
    // teamMemberId: {
    //   type: new GraphQLNonNull(GraphQLID),
    //   description: 'The ID for the team Member, stored int he participant table to reduce an additional DB hit'
    // },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The Id of the team/meeting'
    },
    connections: {
      type: new GraphQLList(Connection),
      description: 'The connections (tabs and devices) that the user has had during the meeting'
    },
    connectionStatus: {
      type: ConnectionStatus,
      description: 'The overall connection status (best of all connections)',
      resolve(source) {
        const {connections} = source;
        if (Array.isArray(connections)) {
          const topPriority = connections.reduce((highScore, connection) => {
            const connectionScore = connectionPriority.indexOf(connection.status);
            return Math.max(highScore, connectionScore);
          });
          return connectionPriority[topPriority];
        }
        return CLOSED;
      }
    }
  })
});
