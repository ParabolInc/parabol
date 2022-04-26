import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import AzureDevOpsProjectId from 'parabol-client/shared/gqlIds/AzureDevOpsProjectId'
import {GQLContext} from '../graphql'
import IntegrationProviderServiceEnum from './IntegrationProviderServiceEnum'
import RepoIntegration, {repoIntegrationFields} from './RepoIntegration'

const AzureDevOpsRemoteProject = new GraphQLObjectType<any, GQLContext>({
  name: 'AzureDevOpsRemoteProject',
  description: 'A project fetched from Azure DevOps in real time',
  interfaces: () => [RepoIntegration],
  isTypeOf: ({service}) => service === 'azureDevOps',
  fields: () => ({
    ...repoIntegrationFields(),
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: ({instanceId, key}) => AzureDevOpsProjectId.join(instanceId, key)
    },
    service: {
      type: new GraphQLNonNull(IntegrationProviderServiceEnum),
      resolve: () => 'azureDevOps'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The parabol teamId this issue was fetched for'
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The parabol userId this issue was fetched for'
    },
    self: {
      type: new GraphQLNonNull(GraphQLID)
    },
    instanceId: {
      type: new GraphQLNonNull(GraphQLID),
      description:
        'The instance ID that the project lives on'
    },
    key: {
      type: new GraphQLNonNull(GraphQLString)
    },
    name: {
      type: new GraphQLNonNull(GraphQLString)
    },
    style: {
      type: new GraphQLNonNull(GraphQLString)
    }
  })
})

export default AzureDevOpsRemoteProject
