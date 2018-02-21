import {GraphQLObjectType} from 'graphql';
import {resolveTask} from 'server/graphql/resolvers';
import Task from 'server/graphql/types/Task';

const CreateGitHubIssuePayload = new GraphQLObjectType({
  name: 'CreateGitHubIssuePayload',
  fields: () => ({
    task: {
      type: Task,
      resolve: resolveTask
    }
  })
});

export default CreateGitHubIssuePayload;
