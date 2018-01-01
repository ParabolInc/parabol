import {GraphQLObjectType} from 'graphql';
import {resolveProject} from 'server/graphql/resolvers';
import Project from 'server/graphql/types/Project';

const ProjectAdded = new GraphQLObjectType({
  name: 'ProjectAdded',
  fields: () => ({
    project: {
      type: Project,
      resolve: resolveProject
    }
  })
});

export default ProjectAdded;
