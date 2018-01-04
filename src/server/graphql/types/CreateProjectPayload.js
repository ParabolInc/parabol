import {GraphQLObjectType} from 'graphql';
import {resolveNotificationForViewer, resolveProject} from 'server/graphql/resolvers';
import NotifyProjectInvolves from 'server/graphql/types/NotifyProjectInvolves';
import Project from 'server/graphql/types/Project';

const CreateProjectPayload = new GraphQLObjectType({
  name: 'CreateProjectPayload',
  fields: () => ({
    project: {
      type: Project,
      resolve: resolveProject
    },
    involvementNotification: {
      type: NotifyProjectInvolves,
      resolve: resolveNotificationForViewer
    }
  })
});

export default CreateProjectPayload;
