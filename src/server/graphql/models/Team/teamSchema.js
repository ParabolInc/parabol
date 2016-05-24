import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';

export const Team = new GraphQLObjectType({
  name: 'Team',
  description: 'A team',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique team ID'},
    name: {type: GraphQLString, description: 'The name of the team'}
  })
});
