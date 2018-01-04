import {GraphQLID, GraphQLObjectType} from 'graphql';
import {resolveProject} from 'server/graphql/resolvers';
import Project from 'server/graphql/types/Project';

const UpdateProjectPayload = new GraphQLObjectType({
  name: 'UpdateProjectPayload',
  fields: () => ({
    project: {
      type: Project,
      resolve: resolveProject
    },
    privitizedProjectId: {
      type: GraphQLID,
      description: 'If a project was just turned private, this its ID, else null',
      resolve: ({projectId, isPrivitized}) => {
        return isPrivitized ? projectId : null;
      }
    }
  })
});

export default UpdateProjectPayload;
