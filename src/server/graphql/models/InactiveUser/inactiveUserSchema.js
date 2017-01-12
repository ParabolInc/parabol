import {
  GraphQLObjectType,
  GraphQLID,
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';

export const InactiveUser = new GraphQLObjectType({
  name: 'InactiveUser',
  description: 'A period of inactivity for a user',
  fields: () => ({
    id: {
      type: GraphQLID,
      description: 'An id unique to the inactivity period'
    },
    endAt: {
      type: GraphQLISO8601Type,
      description: 'The date the inactivity ended'
    },
    startAt: {
      type: GraphQLISO8601Type,
      description: 'The date the inactivity started'
    },
    userId: {
      type: GraphQLID,
      description: 'The userId that went inactive'
    }
  })
});
