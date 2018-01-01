import {GraphQLObjectType} from 'graphql';
import {resolveProject} from 'server/graphql/resolvers';
import Project from 'server/graphql/types/Project';

const ProjectRemoved = new GraphQLObjectType({
  name: 'ProjectRemoved',
  fields: () => ({
    project: {
      type: Project,
      resolve: resolveProject
    }
  })
});

export default ProjectRemoved;
