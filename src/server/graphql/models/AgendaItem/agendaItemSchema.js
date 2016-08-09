import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';

export const AgendaItem = new GraphQLObjectType({
  name: 'AgendaItem',
  description: 'A request placeholder that will likely turn into 1 or more tasks',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique agenda item id'},
    content: {type: new GraphQLNonNull(GraphQLString), description: 'The body of the agenda item'},
    teamId: {type: new GraphQLNonNull(GraphQLID), description: 'The team for this agenda item'},
    userId: {type: new GraphQLNonNull(GraphQLID), description: 'The userId that created this agenda item'},
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the placeholder was created'
    }
  })
});
