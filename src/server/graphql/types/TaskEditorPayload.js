import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql';
import User from 'server/graphql/types/User';

const TaskEditorPayload = new GraphQLObjectType({
  name: 'TaskEditorPayload',
  fields: () => ({
    taskId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The taskId of the card being edited'
    },
    editing: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if they started editing, false if they stopped'
    },
    user: {
      type: User,
      description: 'The user editing the task',
      resolve: ({userId}, args, {dataLoader}) => {
        return dataLoader.get('users').load(userId);
      }
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The userId of the person editing the task'
    }
  })
});

export default TaskEditorPayload;
