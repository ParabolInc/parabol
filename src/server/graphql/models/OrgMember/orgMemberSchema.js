import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLEnumType
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';

export const Organization = new GraphQLObjectType({
  name: 'Organization',
  description: 'An organization',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique orgMemberId (userId::orgId)'},
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the organization'
    },
    lastLogin: {
      type: GraphQLISO8601Type,
      description: 'The datetime orgMember last logged into the system. Used to compute isActive'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the organization was created'
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The userId of the org member'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime the organization was last updated'
    },
  })
});
