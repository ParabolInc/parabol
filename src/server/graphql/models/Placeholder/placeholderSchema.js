import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';

export const Placeholder = new GraphQLObjectType({
  name: 'Placeholder',
  description: 'A request placeholder that will likely turn into 1 or more tasks',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique placeholder id'},
    content: {type: new GraphQLNonNull(GraphQLString), description: 'The body of the placeholder'},
    teamId: {type: new GraphQLNonNull(GraphQLID), description: 'The team for this placeholder'},
    userId: {type: new GraphQLNonNull(GraphQLID), description: 'The userId that created this placeholder'},
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the placeholder was created'
    }
  })
});
