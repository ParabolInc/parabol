import {GraphQLID, GraphQLInputObjectType, GraphQLString} from 'graphql';
import GraphQLURLType from 'server/graphql/types/GraphQLURLType';


const UpdateOrgInput = new GraphQLInputObjectType({
  name: 'UpdateOrgInput',
  fields: () => ({
    id: {type: GraphQLID, description: 'The unique action ID'},
    name: {
      type: GraphQLString,
      description: 'The name of the org'
    },
    picture: {
      type: GraphQLURLType,
      description: 'The org avatar'
    }
  })
});

export default UpdateOrgInput;
