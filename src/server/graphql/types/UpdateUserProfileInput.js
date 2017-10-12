import {GraphQLID, GraphQLInputObjectType, GraphQLString} from 'graphql';
import GraphQLURLType from 'server/graphql/types/GraphQLURLType';

const UpdateUserProfileInput = new GraphQLInputObjectType({
  name: 'UpdateUserProfileInput',
  fields: () => ({
    id: {type: GraphQLID, description: 'The unique userId'},
    picture: {
      type: GraphQLURLType,
      description: 'A link to the user’s profile image.'
    },
    preferredName: {
      type: GraphQLString,
      description: 'The name, as confirmed by the user'
    }
  })
});

export default UpdateUserProfileInput;
