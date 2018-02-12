import {GraphQLID, GraphQLObjectType} from 'graphql';
import {makeResolveNotificationForViewer, resolveTask} from 'server/graphql/resolvers';
import NotifyTaskInvolves from 'server/graphql/types/NotifyTaskInvolves';
import Task from 'server/graphql/types/Task';

const UpdateTaskPayload = new GraphQLObjectType({
  name: 'UpdateTaskPayload',
  fields: () => ({
    task: {
      type: Task,
      resolve: resolveTask
    },
    privatizedTaskId: {
      type: GraphQLID,
      description: 'If a task was just turned private, this its ID, else null',
      resolve: ({taskId, isPrivatized}) => {
        return isPrivatized ? taskId : null;
      }
    },
    addedNotification: {
      type: NotifyTaskInvolves,
      resolve: makeResolveNotificationForViewer('notificationIdsToAdd', 'notificationsToAdd')
    },
    removedNotification: {
      type: NotifyTaskInvolves,
      resolve: makeResolveNotificationForViewer('notificationIdsToRemove', 'notificationsToRemove')
    }
  })
});

export default UpdateTaskPayload;
