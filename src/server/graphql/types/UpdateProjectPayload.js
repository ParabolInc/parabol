import {GraphQLNonNull, GraphQLObjectType} from 'graphql';
import RelayProject from 'server/graphql/types/RelayProject';

const UpdateProjectPayload = new GraphQLObjectType({
  name: 'UpdateProjectPayload',
  fields: () => ({
    project: {
      type: new GraphQLNonNull(RelayProject)
    }
  })
});

export default UpdateProjectPayload;
