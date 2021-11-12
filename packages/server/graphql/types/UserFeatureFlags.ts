import {GraphQLBoolean, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'

const UserFeatureFlags = new GraphQLObjectType<any, GQLContext>({
  name: 'UserFeatureFlags',
  description: 'The user account profile',
  fields: () => ({
    gitlab: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if gitlab is allowed',
      resolve: ({gitlab}) => !!gitlab
    },
    video: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the user has access to retro meeting video',
      resolve: ({video}) => !!video
    }
  })
})

export default UserFeatureFlags
