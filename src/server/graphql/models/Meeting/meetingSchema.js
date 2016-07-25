import {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';

export const Meeting = new GraphQLObjectType({
  name: 'Meeting',
  description: 'A team meeting history for all current and previous meetings',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique meeting id'},
    meetingNumber: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The auto-incrementing meeting number for the team'
    },
    teamId: {type: new GraphQLNonNull(GraphQLID), description: 'The team associated with this meeting'},
    isActive: {type: GraphQLBoolean, description: 'true if a meeting is currently in progress'},
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the meeting was created'
    },
    endedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the meeting officially ended'
    }
  })
});
