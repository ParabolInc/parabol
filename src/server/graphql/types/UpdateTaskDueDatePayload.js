import {GraphQLObjectType} from 'graphql';
import {resolveTask} from 'server/graphql/resolvers';
import Task from 'server/graphql/types/Task';
import StandardMutationError from 'server/graphql/types/StandardMutationError';

const UpdateTaskDueDatePayload = new GraphQLObjectType({
  name: 'UpdateTaskDueDatePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    task: {
      type: Task,
      resolve: resolveTask
    }
  })
});

export default UpdateTaskDueDatePayload;
