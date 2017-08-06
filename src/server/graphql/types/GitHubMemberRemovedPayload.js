import {GraphQLList, GraphQLObjectType} from 'graphql';
import LeaveIntegrationPayload from 'server/graphql/types/LeaveIntegrationPayload';

const GitHubMemberRemovedPayload = new GraphQLObjectType({
  name: 'GitHubMemberRemovedPayload',
  fields: () => ({
    leaveIntegration: {
      type: new GraphQLList((LeaveIntegrationPayload))
    }
  })
});

export default GitHubMemberRemovedPayload;
