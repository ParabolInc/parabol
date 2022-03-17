import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import JiraServerRestManager from '../../integrations/jiraServer/JiraServerRestManager'
import defaultJiraProjectAvatar from '../../utils/defaultJiraProjectAvatar'
import {GQLContext} from '../graphql'
import IntegrationProviderServiceEnum from './IntegrationProviderServiceEnum'
import JiraRemoteAvatarUrls from './JiraRemoteAvatarUrls'
import JiraRemoteProjectCategory from './JiraRemoteProjectCategory'
import RepoIntegration, {repoIntegrationFields} from './RepoIntegration'

const JiraServerRemoteProject = new GraphQLObjectType<any, GQLContext>({
  name: 'JiraServerRemoteProject',
  description: 'A project fetched from Jira in real time',
  interfaces: () => [RepoIntegration],
  isTypeOf: ({service}) => service === 'jiraServer',
  fields: () => ({
    ...repoIntegrationFields(),
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: (item) => IntegrationRepoId.join(item)
    },
    service: {
      type: new GraphQLNonNull(IntegrationProviderServiceEnum),
      resolve: () => 'jiraServer'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The parabol teamId this issue was fetched for'
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The parabol userId this issue was fetched for'
    },
    name: {
      type: new GraphQLNonNull(GraphQLString)
    },
    avatar: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: async ({avatarUrls, teamId, userId}, _args: unknown, {dataLoader}) => {
        const url = avatarUrls['48x48']
        const auth = await dataLoader
          .get('teamMemberIntegrationAuths')
          .load({service: 'jiraServer', teamId, userId})
        if (!auth) return defaultJiraProjectAvatar
        const provider = await dataLoader.get('integrationProviders').loadNonNull(auth.providerId)
        const manager = new JiraServerRestManager(
          provider.serverBaseUrl!,
          provider.consumerKey!,
          provider.consumerSecret!,
          auth.accessToken!,
          auth.accessTokenSecret!
        )
        const avatar = await manager.getProjectAvatar(url)
        return avatar || defaultJiraProjectAvatar
      }
    },
    avatarUrls: {
      type: new GraphQLNonNull(JiraRemoteAvatarUrls)
    },
    projectCategory: {
      type: new GraphQLNonNull(JiraRemoteProjectCategory)
    }
  })
})

export default JiraServerRemoteProject
