import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import AzureDevopsRemoteAvatarUrls from './AzureDevopsRemoteAvatarUrls'
import AzureDevopsRemoteProjectCategory from './AzureDevopsRemoteProjectCategory'

const AzureDevopsRemoteProject = new GraphQLObjectType({
  name: 'AzureDevopsRemoteProject',
  description: 'A project fetched from Azure Devops in real time',
  fields: () => ({
    self: {
      type: new GraphQLNonNull(GraphQLID)
    },
    id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    key: {
      type: new GraphQLNonNull(GraphQLString)
    },
    name: {
      type: new GraphQLNonNull(GraphQLString)
    },
    avatarUrls: {
      type: new GraphQLNonNull(AzureDevopsRemoteAvatarUrls)
    },
    projectCategory: {
      type: new GraphQLNonNull(AzureDevopsRemoteProjectCategory)
    },
    simplified: {
      type: new GraphQLNonNull(GraphQLBoolean)
    },
    style: {
      type: new GraphQLNonNull(GraphQLString)
    }
  })
})

export default AzureDevopsRemoteProject
