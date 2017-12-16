import {GraphQLInputObjectType, GraphQLString} from 'graphql';
import GraphQLURLType from 'server/graphql/types/GraphQLURLType';

const UpdatedTeamInput = new GraphQLInputObjectType({
  name: 'UpdatedTeamInput',
  fields: () => ({
    name: {type: GraphQLString, description: 'The name of the team'},
    picture: {
      type: GraphQLURLType,
      description: 'A link to the team’s profile image.'
    }
  })
});

export default UpdatedTeamInput;
