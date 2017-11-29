import {GraphQLObjectType} from 'graphql';
import Task from 'server/graphql/types/Task';

const CreateTaskPayload = new GraphQLObjectType({
  name: 'CreateTaskPayload',
  fields: () => ({
    task: {
      type: Task
    }
  })
});

export default CreateTaskPayload;
