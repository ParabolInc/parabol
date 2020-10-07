import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import JiraRemoteAvatarUrls from './JiraRemoteAvatarUrls'
import JiraRemoteProjectCategory from './JiraRemoteProjectCategory'
import {GQLContext} from '../graphql'

const JiraRemoteProject = new GraphQLObjectType<any, GQLContext>({
  name: 'JiraRemoteProject',
  description: 'A project fetched from Jira in real time',
  fields: () => ({
    self: {
      type: new GraphQLNonNull(GraphQLID)
    },
    cloudId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The cloud ID that the project lives on. Does not exist on the Jira object!'
    },
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: ({cloudId, key}) => `${cloudId}:${key}`
    },
    key: {
      type: new GraphQLNonNull(GraphQLString)
    },
    name: {
      type: new GraphQLNonNull(GraphQLString)
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
