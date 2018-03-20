import {GraphQLObjectType} from 'graphql';
import User from 'server/graphql/types/User';

const DisconnectSocketPayload = new GraphQLObjectType({
  name: 'DisconnectSocketPayload',
  fields: () => ({
    user: {
      type: User,
      description: 'The user that disconnected'
    }
  })
});

export default DisconnectSocketPayload;
