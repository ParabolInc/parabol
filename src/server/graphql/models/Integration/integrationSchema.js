import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';

export const Integration = new GraphQLObjectType({
  name: 'Integration',
  description: 'An invitation to become a team member',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The access token to the service'},
    service: {
      type: GraphQLString,
      description: 'The name of the service'
    },
    teamId: {
      type: GraphQLID,
      description: 'The teamMember that the token is linked to'
    },
    userId: {
      type: GraphQLID,
      description: 'The user that the access token is attached to'
    }
  })
});
