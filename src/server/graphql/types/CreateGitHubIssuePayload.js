import {GraphQLObjectType} from 'graphql';
import {resolveProject} from 'server/graphql/resolvers';
import Project from 'server/graphql/types/Project';

const CreateGitHubIssuePayload = new GraphQLObjectType({
  name: 'CreateGitHubIssuePayload',
  fields: () => ({
    project: {
      type: Project,
      resolve: resolveProject
    }
  })
});

export default CreateGitHubIssuePayload;
