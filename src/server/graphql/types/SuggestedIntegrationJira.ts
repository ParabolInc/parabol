import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import SuggestedIntegration, {
  suggestedIntegrationFields
} from 'server/graphql/types/SuggestedIntegration'

const SuggestedIntegrationJira = new GraphQLObjectType({
  name: 'SuggestedIntegrationJira',
  description: 'The details associated with a task integrated with Jira',
  interfaces: () => [SuggestedIntegration],
  fields: () => ({
    ...suggestedIntegrationFields(),
    projectKey: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The project key used by jira as a more human readable proxy for a projectId'
    },
    projectName: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The name of the project as defined by jira'
    },
    cloudId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The cloud ID that the project lives on'
    }
  })
})

export default SuggestedIntegrationJira
