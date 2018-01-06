import {GraphQLID, GraphQLObjectType} from 'graphql';
import {makeResolveNotificationForViewer, resolveProject} from 'server/graphql/resolvers';
import NotifyProjectInvolves from 'server/graphql/types/NotifyProjectInvolves';
import Project from 'server/graphql/types/Project';

const UpdateProjectPayload = new GraphQLObjectType({
  name: 'UpdateProjectPayload',
  fields: () => ({
    project: {
      type: Project,
      resolve: resolveProject
    },
    privitizedProjectId: {
      type: GraphQLID,
      description: 'If a project was just turned private, this its ID, else null',
      resolve: ({projectId, isPrivitized}) => {
        return isPrivitized ? projectId : null;
      }
    },
    addedNotification: {
      type: NotifyProjectInvolves,
      resolve: makeResolveNotificationForViewer('notificationIdsToAdd', 'notificationsToAdd')
    },
    removedNotification: {
      type: NotifyProjectInvolves,
      resolve: makeResolveNotificationForViewer('notificationIdsToRemove', 'notificationsToRemove')
    }
  })
});

export default UpdateProjectPayload;
