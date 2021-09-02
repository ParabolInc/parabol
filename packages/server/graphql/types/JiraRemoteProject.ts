import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import JiraProjectId from '../../../client/shared/gqlIds/JiraProjectId'
import AtlassianServerManager from '../../utils/AtlassianServerManager'
import defaultJiraProjectAvatar from '../../utils/defaultJiraProjectAvatar'
import {GQLContext} from '../graphql'
import JiraRemoteAvatarUrls from './JiraRemoteAvatarUrls'
import JiraRemoteProjectCategory from './JiraRemoteProjectCategory'

const JiraRemoteProject = new GraphQLObjectType<any, GQLContext>({
  name: 'JiraRemoteProject',
  description: 'A project fetched from Jira in real time',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLID),
      resolve: ({cloudId, key}) => JiraProjectId.join(cloudId, key)
    },
    teamId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The parabol teamId this issue was fetched for'
    },
    userId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The parabol userId this issue was fetched for'
    },
    self: {
      type: GraphQLNonNull(GraphQLID)
    },
    cloudId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The cloud ID that the project lives on. Does not exist on the Jira object!'
    },
    key: {
      type: GraphQLNonNull(GraphQLString)
    },
    name: {
      type: GraphQLNonNull(GraphQLString)
    },
    avatar: {
      type: GraphQLNonNull(GraphQLString),
      resolve: async ({avatarUrls, teamId, userId}, _args, {dataLoader}) => {
        const url = avatarUrls['48x48']
        const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId})
        if (!auth) return null
        const {accessToken} = auth
        const manager = new AtlassianServerManager(accessToken)
        const avatar = await manager.getProjectAvatar(url)
        return avatar || defaultJiraProjectAvatar
      }
    },
    avatarUrls: {
      type: GraphQLNonNull(JiraRemoteAvatarUrls)
    },
    projectCategory: {
      type: GraphQLNonNull(JiraRemoteProjectCategory)
    },
    simplified: {
      type: GraphQLNonNull(GraphQLBoolean)
    },
    style: {
      type: GraphQLNonNull(GraphQLString)
    }
  })
})

export default JiraRemoteProject
