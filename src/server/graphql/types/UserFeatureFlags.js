import {GraphQLBoolean, GraphQLObjectType} from 'graphql'

const UserFeatureFlags = new GraphQLObjectType({
  name: 'UserFeatureFlags',
  description: 'The user account profile',
  fields: () => ({
    retro: {
      type: GraphQLBoolean,
      description: 'true if the user has access to retro meetings'
    }
  })
})

export default UserFeatureFlags
