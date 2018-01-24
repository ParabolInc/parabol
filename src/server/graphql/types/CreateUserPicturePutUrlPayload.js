import {GraphQLObjectType} from 'graphql';
import GraphQLURLType from 'server/graphql/types/GraphQLURLType';

const CreateUserPicturePutUrlPayload = new GraphQLObjectType({
  name: 'CreateUserPicturePutUrlPayload',
  fields: () => ({
    url: {
      type: GraphQLURLType
    }
  })
});

export default CreateUserPicturePutUrlPayload;
