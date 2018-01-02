import {GraphQLObjectType} from 'graphql';
import {resolveProject} from 'server/graphql/resolvers';
import NotifyProjectInvolves from 'server/graphql/types/NotifyProjectInvolves';
import Project from 'server/graphql/types/Project';

const DeleteProjectPayload = new GraphQLObjectType({
  name: 'DeleteProjectPayload',
  fields: () => ({
    project: {
      type: Project,
      description: 'The project that was deleted',
      resolve: resolveProject
    },
    removedInvolvementNotification: {
      type: NotifyProjectInvolves,
      description: 'The notification stating that the viewer was mentioned or assigned'
    }
  })
});

export default DeleteProjectPayload;
