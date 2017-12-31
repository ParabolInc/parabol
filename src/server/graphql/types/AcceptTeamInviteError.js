import {GraphQLObjectType, GraphQLString} from 'graphql';

const AcceptTeamInviteError = new GraphQLObjectType({
  name: 'AcceptTeamInviteError',
  fields: () => ({
    title: {
      type: GraphQLString,
      description: 'The title of the error'
    },
    message: {
      type: GraphQLString,
      description: 'The full error'
    }
  })
});

export default AcceptTeamInviteError;
