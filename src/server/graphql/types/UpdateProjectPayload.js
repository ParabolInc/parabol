import {GraphQLObjectType} from 'graphql';
import Project from 'server/graphql/types/Project';
import ProjectEditorPayload from 'server/graphql/types/ProjectEditorPayload';

const UpdateProjectPayload = new GraphQLObjectType({
  name: 'UpdateProjectPayload',
  fields: () => ({
    project: {
      type: Project
    },
    editor: {
      type: ProjectEditorPayload,
      description: 'An announcement to all subscribers that someone is editing the project'
    }
  })
});

export default UpdateProjectPayload;
