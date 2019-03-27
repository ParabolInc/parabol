import {GraphQLBoolean, GraphQLObjectType} from 'graphql'

const UserFeatureFlags = new GraphQLObjectType({
  name: 'UserFeatureFlags',
  description: 'The user account profile',
  fields: () => ({
    video: {
      type: GraphQLBoolean,
      description: 'true if the user has access to retro meeting video'
    }
  })
})

export default UserFeatureFlags
