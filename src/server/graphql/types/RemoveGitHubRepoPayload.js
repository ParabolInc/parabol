import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql';

const RemoveGitHubRepoPayload = new GraphQLObjectType({
  name: 'RemoveGitHubRepoPayload',
  fields: () => ({
    deletedId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  })
});

export default RemoveGitHubRepoPayload;
