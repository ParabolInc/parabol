import {GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {getInstanceId} from '../../utils/azureDevOps/azureDevOpsFieldTypeToId'
import sendToSentry from '../../utils/sendToSentry'
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
      resolve: ({url, instanceId}: {url?: string; instanceId?: string}) => {
        if (instanceId) return instanceId
        return getInstanceId(new URL(url!))
      }
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: async (
        {
          name,
          projectKey,
          instanceId,
          userId,
          teamId
        }: {name?: string; projectKey: string; instanceId: string; userId: string; teamId: string},
        _args,
        {dataLoader}
      ) => {
        if (name) return name
        const projectRes = await dataLoader
          .get('azureDevOpsProject')
          .load({instanceId, projectId: projectKey, userId, teamId})
        // TODO: fix projectId / key inconsistencies: https://github.com/ParabolInc/parabol/issues/7073
        if (!projectRes) {
          const err = new Error(`Unable to get project ${projectKey}`)
          sendToSentry(err, {tags: {instanceId, projectKey, userId, teamId}})
          return
        }
        return projectRes.name
      }
    },
    revision: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    state: {
      type: new GraphQLNonNull(GraphQLString)
    },
    url: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: async (
        {
          url,
          projectKey,
          instanceId,
          userId,
          teamId
        }: {url?: string; projectKey: string; instanceId: string; userId: string; teamId: string},
        _args,
        {dataLoader}
      ) => {
        if (url) return url
        const projectRes = await dataLoader
          .get('azureDevOpsProject')
          .load({instanceId, projectId: projectKey, userId, teamId})
        // TODO: fix projectId / key inconsistencies: https://github.com/ParabolInc/parabol/issues/7073
        if (!projectRes) {
          const err = new Error(`Unable to get project ${projectKey}`)
          sendToSentry(err, {tags: {instanceId, projectKey, userId, teamId}})
          return
        }
        return projectRes.url
      }
    },
    visibility: {
      type: new GraphQLNonNull(GraphQLString)
    }
  })
})

export default AzureDevOpsRemoteProject
