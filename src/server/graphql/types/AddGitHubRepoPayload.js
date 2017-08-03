import {GraphQLNonNull, GraphQLObjectType} from 'graphql';
import GitHubIntegration from 'server/graphql/types/GitHubIntegration';

const AddGitHubRepoPayload = new GraphQLObjectType({
  name: 'AddGitHubRepoPayload',
  fields: () => ({
    repo: {
      type: new GraphQLNonNull(GitHubIntegration)
    }
  })
});

export default AddGitHubRepoPayload;
