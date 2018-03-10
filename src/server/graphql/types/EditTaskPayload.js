import {GraphQLBoolean, GraphQLObjectType} from 'graphql';
import {resolveTask} from 'server/graphql/resolvers';
import Task from 'server/graphql/types/Task';
import User from 'server/graphql/types/User';
import StandardMutationError from 'server/graphql/types/StandardMutationError';

const EditTaskPayload = new GraphQLObjectType({
  name: 'EditTaskPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
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
