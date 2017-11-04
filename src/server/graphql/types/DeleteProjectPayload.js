import {GraphQLObjectType} from 'graphql';
import RelayProject from 'server/graphql/types/RelayProject';

const DeleteProjectPayload = new GraphQLObjectType({
  name: 'DeleteProjectPayload',
  fields: () => ({
    project: {
      type: RelayProject,
      description: 'The project that was deleted'
    }
  })
});

export default DeleteProjectPayload;
