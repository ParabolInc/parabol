import {GraphQLObjectType} from 'graphql';
import {resolveNotificationForViewer, resolveTask} from 'server/graphql/resolvers';
import NotifyTaskInvolves from 'server/graphql/types/NotifyTaskInvolves';
import Task from 'server/graphql/types/Task';

const CreateTaskPayload = new GraphQLObjectType({
  name: 'CreateTaskPayload',
  fields: () => ({
    task: {
      type: Task,
      resolve: resolveTask
    },
    involvementNotification: {
      type: NotifyTaskInvolves,
      resolve: resolveNotificationForViewer
    }
  })
});

export default CreateTaskPayload;
