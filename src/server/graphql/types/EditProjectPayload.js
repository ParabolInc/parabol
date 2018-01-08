import {GraphQLBoolean, GraphQLObjectType} from 'graphql';
import {resolveProject} from 'server/graphql/resolvers';
import Project from 'server/graphql/types/Project';
import User from 'server/graphql/types/User';

const EditProjectPayload = new GraphQLObjectType({
  name: 'EditProjectPayload',
  fields: () => ({
    project: {
      type: Project,
      resolve: resolveProject
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

export default EditProjectPayload;
