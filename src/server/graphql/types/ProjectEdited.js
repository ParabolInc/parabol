import {GraphQLBoolean, GraphQLObjectType} from 'graphql';
import {resolveProject} from 'server/graphql/resolvers';
import Project from 'server/graphql/types/Project';
import User from 'server/graphql/types/User';

const ProjectEdited = new GraphQLObjectType({
  name: 'ProjectEdited',
  fields: () => ({
    project: {
      type: Project,
      resolve: resolveProject
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

export default ProjectEdited;
