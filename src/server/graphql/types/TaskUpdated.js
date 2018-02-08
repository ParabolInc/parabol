import {GraphQLObjectType} from 'graphql';
import {resolveTask} from 'server/graphql/resolvers';
import Task from 'server/graphql/types/Task';

const TaskUpdated = new GraphQLObjectType({
  name: 'TaskUpdated',
  fields: () => ({
    task: {
      type: Task,
      resolve: resolveTask
    }
  })
});

export default TaskUpdated;
