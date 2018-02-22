import {GraphQLObjectType} from 'graphql';
import {resolveNotificationForViewer} from 'server/graphql/resolvers';
import NotifyTaskInvolves from 'server/graphql/types/NotifyTaskInvolves';
import Task from 'server/graphql/types/Task';

const DeleteTaskPayload = new GraphQLObjectType({
  name: 'DeleteTaskPayload',
  fields: () => ({
    task: {
      type: Task,
      description: 'The task that was deleted'
    },
    involvementNotification: {
      type: NotifyTaskInvolves,
      description: 'The notification stating that the viewer was mentioned or assigned',
      resolve: resolveNotificationForViewer
    }
  })
});

export default DeleteTaskPayload;
