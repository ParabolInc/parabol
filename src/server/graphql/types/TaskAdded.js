import {GraphQLObjectType} from 'graphql';
import {resolveTask} from 'server/graphql/resolvers';
import Task from 'server/graphql/types/Task';

const TaskAdded = new GraphQLObjectType({
  name: 'TaskAdded',
  fields: () => ({
    task: {
      type: Task,
      resolve: resolveTask
    }
  })
});

export default TaskAdded;
