import {GraphQLObjectType} from 'graphql';
import GraphQLURLType from 'server/graphql/types/GraphQLURLType';
import StandardMutationError from 'server/graphql/types/StandardMutationError';

const CreatePicturePutUrlPayload = new GraphQLObjectType({
  name: 'CreatePicturePutUrlPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    url: {
      type: GraphQLURLType
    }
  })
});

export default CreatePicturePutUrlPayload;
