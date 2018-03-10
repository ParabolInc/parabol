import {GraphQLID, GraphQLObjectType} from 'graphql';
import {makeResolveNotificationForViewer, resolveTask} from 'server/graphql/resolvers';
import NotifyTaskInvolves from 'server/graphql/types/NotifyTaskInvolves';
import Task from 'server/graphql/types/Task';

const ChangeTaskTeamPayload = new GraphQLObjectType({
  name: 'ChangeTaskTeamPayload',
  fields: () => ({
    task: {
      type: Task,
      resolve: resolveTask
    },
    removedNotification: {
      type: NotifyTaskInvolves,
      resolve: makeResolveNotificationForViewer('notificationIdsToRemove', 'notificationsToRemove')
    },
    removedTaskId: {
      type: GraphQLID,
      description: 'the taskId sent to a user who is not on the new team so they can remove it from their client',
      resolve: async ({taskId}) => {
        return taskId;
      }
    }
  })
});

export default ChangeTaskTeamPayload;
