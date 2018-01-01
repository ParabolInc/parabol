import {GraphQLObjectType} from 'graphql';
import {resolveProject} from 'server/graphql/resolvers';
import Project from 'server/graphql/types/Project';

const ProjectUpdated = new GraphQLObjectType({
  name: 'ProjectUpdated',
  fields: () => ({
    project: {
      type: Project,
      resolve: resolveProject
    }
  })
});

export default ProjectUpdated;
