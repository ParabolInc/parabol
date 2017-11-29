import {GraphQLNonNull, GraphQLObjectType} from 'graphql';
import RelayTask from 'server/graphql/types/RelayTask';

const UpdateTaskPayload = new GraphQLObjectType({
  name: 'UpdateTaskPayload',
  fields: () => ({
    task: {
      type: new GraphQLNonNull(RelayTask)
    }
  })
});

export default UpdateTaskPayload;
