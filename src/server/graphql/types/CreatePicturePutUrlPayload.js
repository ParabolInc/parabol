import {GraphQLObjectType} from 'graphql';
import GraphQLURLType from 'server/graphql/types/GraphQLURLType';

const CreatePicturePutUrlPayload = new GraphQLObjectType({
  name: 'CreatePicturePutUrlPayload',
  fields: () => ({
    url: {
      type: GraphQLURLType
    }
  })
});

export default CreatePicturePutUrlPayload;
