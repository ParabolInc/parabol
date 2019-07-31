import {GraphQLNonNull, GraphQLID, GraphQLObjectType} from 'graphql'

const JiraRemoteAvatarUrls = new GraphQLObjectType({
  name: 'JiraRemoteAvatarUrls',
  description: 'A project fetched from Jira in real time',
  fields: () => ({
    x48: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: (source) => {
        return source['48x48']
      }
    },
    x24: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: (source) => {
        return source['24x24']
      }
    },
    x16: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: (source) => {
        return source['16x16']
      }
    },
    x32: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: (source) => {
        return source['32x32']
      }
    }
  })
})

export default JiraRemoteAvatarUrls
