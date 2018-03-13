import {GraphQLObjectType} from 'graphql';
import {resolveNotificationForViewer, resolveTask} from 'server/graphql/resolvers';
import NotifyTaskInvolves from 'server/graphql/types/NotifyTaskInvolves';
import Task from 'server/graphql/types/Task';
import StandardMutationError from 'server/graphql/types/StandardMutationError';

const CreateTaskPayload = new GraphQLObjectType({
  name: 'CreateTaskPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
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
