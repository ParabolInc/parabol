import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import AzureDevopsRemoteProject from './AzureDevopsRemoteProject'
import SuggestedIntegration, {suggestedIntegrationFields} from './SuggestedIntegration'
import {getUserId} from '../../utils/authorization'

const SuggestedIntegrationAzureDevops = new GraphQLObjectType({
  name: 'SuggestedIntegrationAzureDevops',
  description: 'The details associated with a task integrated with Azure Devops',
  interfaces: () => [SuggestedIntegration],
  fields: () => ({
    ...suggestedIntegrationFields(),
    avatar: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'URL to a 24x24 avatar icon'
    },
    projectName: {
      type: new GraphQLNonNull(GraphQLID),
      description:
        'The name of the project, prefixed with the organization name if more than 1 project exists'
    },
    organization: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The organization that the project lives on'
    },
    remoteProject: {
      type: new GraphQLNonNull(AzureDevopsRemoteProject),
      description: 'The full project document fetched from Azure Devops',
      resolve: async ({organization, projectId, teamId}, _args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        const accessToken = await dataLoader
          .get('freshAzureDevopsAccessToken')
          .load({teamId, userId: viewerId})
        return dataLoader
          .get('azureDevopsRemoteProject')
          .load({accessToken, organization, projectId})
      }
    }
  })
})

export default SuggestedIntegrationAzureDevops
