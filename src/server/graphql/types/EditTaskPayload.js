import {GraphQLBoolean, GraphQLObjectType} from 'graphql';
import {resolveTask} from 'server/graphql/resolvers';
import Task from 'server/graphql/types/Task';
import User from 'server/graphql/types/User';

const EditTaskPayload = new GraphQLObjectType({
  name: 'EditTaskPayload',
  fields: () => ({
    task: {
      type: Task,
      resolve: resolveTask
    },
    editor: {
      type: User,
      resolve: ({editorId}, args, {dataLoader}) => {
        return dataLoader.get('users').load(editorId);
      }
    },
    isEditing: {
      type: GraphQLBoolean,
      description: 'true if the editor is editing, false if they stopped editing'
    }
  })
});

export default EditTaskPayload;
