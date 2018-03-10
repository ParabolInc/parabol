import {GraphQLObjectType} from 'graphql';
import {resolveTask} from 'server/graphql/resolvers';
import Task from 'server/graphql/types/Task';
import StandardMutationError from 'server/graphql/types/StandardMutationError';

const CreateGitHubIssuePayload = new GraphQLObjectType({
  name: 'CreateGitHubIssuePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    task: {
      type: Task,
      resolve: resolveTask
    }
  })
});

export default CreateGitHubIssuePayload;
