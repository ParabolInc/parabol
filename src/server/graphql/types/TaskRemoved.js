import {GraphQLObjectType} from 'graphql';
import {resolveTask} from 'server/graphql/resolvers';
import Task from 'server/graphql/types/Task';

const TaskRemoved = new GraphQLObjectType({
  name: 'TaskRemoved',
  fields: () => ({
    task: {
      type: Task,
      resolve: resolveTask
    }
  })
});

export default TaskRemoved;
