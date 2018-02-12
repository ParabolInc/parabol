import {GraphQLList, GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql';

const RemoveGitHubRepoPayload = new GraphQLObjectType({
  name: 'RemoveGitHubRepoPayload',
  fields: () => ({
    deletedId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    archivedTaskIds: {
      type: new GraphQLList(GraphQLID)
    }
  })
});

export default RemoveGitHubRepoPayload;
