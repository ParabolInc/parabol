import {GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {getInstanceId} from '../../utils/azureDevOps/azureDevOpsFieldTypeToId'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
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
      type: new GraphQLNonNull(GraphQLID)
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
    lastUpdateTime: {
      type: new GraphQLNonNull(GraphQLISO8601Type)
    },
    self: {
      type: new GraphQLNonNull(GraphQLID)
    },
    instanceId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The instance ID that the project lives on',
      resolve: ({url}: {url: string}) => getInstanceId(new URL(url))
    },
    name: {
      type: new GraphQLNonNull(GraphQLString)
    },
    revision: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    state: {
      type: new GraphQLNonNull(GraphQLString)
    },
    url: {
      type: new GraphQLNonNull(GraphQLString)
    },
    visibility: {
      type: new GraphQLNonNull(GraphQLString)
    }
  })
})

export default AzureDevOpsRemoteProject
