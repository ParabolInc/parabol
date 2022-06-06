import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import AtlassianTeamIntegration from './AtlassianTeamIntegration'
import AzureDevOpsTeamIntegration from './AzureDevOpsTeamIntegration'

const TeamIntegrations = new GraphQLObjectType<any, GQLContext>({
  name: 'TeamIntegrations',
  description: 'All the available integrations available for this team member',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'composite',
      resolve: ({id: teamId}) => `integrations:${teamId}`
    },
    atlassian: {
      type: new GraphQLNonNull(AtlassianTeamIntegration),
      description: 'All things associated with an atlassian integration for a team member',
      resolve: async (source) => source
    },
    azureDevOps: {
      type: new GraphQLNonNull(AzureDevOpsTeamIntegration),
      description: 'All things associated with an AzureDevOps integration for a team member',
      resolve: async (source) => source
    }
  })
})

export default TeamIntegrations
