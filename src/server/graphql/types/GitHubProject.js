import {GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import IntegrationService from 'server/graphql/types/IntegrationService';
import ProjectIntegration from 'server/graphql/types/ProjectIntegration';

const GitHubProject = new GraphQLObjectType({
  name: 'GitHubProject',
  description: 'The details associated with a project integrated with GitHub',
  interfaces: () => [ProjectIntegration],
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

export default GitHubProject;
