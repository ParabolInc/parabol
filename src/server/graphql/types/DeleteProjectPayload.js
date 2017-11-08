import {GraphQLObjectType} from 'graphql';
import Project from 'server/graphql/types/Project';

const DeleteProjectPayload = new GraphQLObjectType({
  name: 'DeleteProjectPayload',
  fields: () => ({
    project: {
      type: Project,
      description: 'The project that was deleted'
    }
  })
});

export default DeleteProjectPayload;
