import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import JiraProjectId from 'parabol-client/shared/gqlIds/JiraProjectId'
import {JiraProject} from 'parabol-client/utils/AtlassianManager'
import {
  createImageUrlHash,
  createParabolImageUrl,
  downloadAndCacheImage
} from '../../utils/atlassian/jiraImages'
import AtlassianServerManager from '../../utils/AtlassianServerManager'
import {GQLContext} from '../graphql'
import IntegrationProviderServiceEnum from './IntegrationProviderServiceEnum'
import JiraRemoteAvatarUrls from './JiraRemoteAvatarUrls'
import JiraRemoteProjectCategory from './JiraRemoteProjectCategory'
import RepoIntegration, {repoIntegrationFields} from './RepoIntegration'

export type JiraRemoteProjectSource = JiraProject & {
  service: 'jira'
  cloudId: string
  teamId: string
  userId: string
}

const JiraRemoteProject = new GraphQLObjectType<JiraRemoteProjectSource, GQLContext>({
  name: 'JiraRemoteProject',
  description: 'A project fetched from Jira in real time',
  interfaces: () => [RepoIntegration],
  isTypeOf: ({service}) => service === 'jira',
  fields: () => ({
    ...repoIntegrationFields(),
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: ({cloudId, key}) => JiraProjectId.join(cloudId, key)
    },
    service: {
      type: new GraphQLNonNull(IntegrationProviderServiceEnum),
      resolve: () => 'jira'
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
    cloudId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The cloud ID that the project lives on. Does not exist on the Jira object!'
    },
    key: {
      type: new GraphQLNonNull(GraphQLString)
    },
    name: {
      type: new GraphQLNonNull(GraphQLString)
    },
    avatar: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: async ({avatarUrls, teamId, userId}, _args: unknown, {dataLoader}) => {
        const url = avatarUrls['48x48']
        const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId})
        if (!auth) return null
        const {accessToken} = auth
        const manager = new AtlassianServerManager(accessToken)
        const avatarUrlHash = createImageUrlHash(url)
        await downloadAndCacheImage(manager, avatarUrlHash, url)
        return createParabolImageUrl(avatarUrlHash)
      }
    },
    avatarUrls: {
      type: new GraphQLNonNull(JiraRemoteAvatarUrls)
    },
    projectCategory: {
      type: new GraphQLNonNull(JiraRemoteProjectCategory)
    },
    simplified: {
      type: new GraphQLNonNull(GraphQLBoolean)
    },
    style: {
      type: new GraphQLNonNull(GraphQLString)
    }
  })
})

export default JiraRemoteProject
