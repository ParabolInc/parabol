import {GraphQLObjectType} from 'graphql';
import {resolveProject} from 'server/graphql/resolvers';
import Project from 'server/graphql/types/Project';

const UpdateProjectPayload = new GraphQLObjectType({
  name: 'UpdateProjectPayload',
  fields: () => ({
    project: {
      type: Project,
      resolve: resolveProject
    }
  })
});

export default UpdateProjectPayload;
