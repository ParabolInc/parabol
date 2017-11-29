import {GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import IntegrationService from 'server/graphql/types/IntegrationService';
import TaskIntegration from 'server/graphql/types/TaskIntegration';

const GitHubTask = new GraphQLObjectType({
  name: 'GitHubTask',
  description: 'The details associated with a task integrated with GitHub',
  interfaces: () => [TaskIntegration],
  fields: () => ({
    integrationId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    service: {
      type: new GraphQLNonNull(IntegrationService)
    },
    nameWithOwner: {
      type: GraphQLString
    },
    issueNumber: {
      type: GraphQLInt
    }
  })
});

export default GitHubTask;
