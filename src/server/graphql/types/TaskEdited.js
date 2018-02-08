import {GraphQLBoolean, GraphQLObjectType} from 'graphql';
import {resolveTask} from 'server/graphql/resolvers';
import Task from 'server/graphql/types/Task';
import User from 'server/graphql/types/User';

const TaskEdited = new GraphQLObjectType({
  name: 'TaskEdited',
  fields: () => ({
    task: {
      type: Task,
      resolve: resolveTask
    },
    editor: {
      type: User,
      resolve: ({editorUserId}, args, {dataLoader}) => {
        return dataLoader.get('users').load(editorUserId);
      }
    },
    isEditing: {
      type: GraphQLBoolean,
      description: 'true if the editor is editing, false if they stopped editing'
    }
  })
});

export default TaskEdited;
