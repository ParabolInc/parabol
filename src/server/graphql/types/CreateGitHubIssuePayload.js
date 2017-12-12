import {GraphQLNonNull, GraphQLObjectType} from 'graphql';
import Project from 'server/graphql/types/Project';

const CreateGitHubIssuePayload = new GraphQLObjectType({
  name: 'CreateGitHubIssuePayload',
  fields: () => ({
    project: {
      type: new GraphQLNonNull(Project)
    }
  })
});

export default CreateGitHubIssuePayload;
