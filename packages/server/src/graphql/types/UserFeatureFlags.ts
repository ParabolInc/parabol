import {GraphQLBoolean, GraphQLObjectType, GraphQLNonNull} from 'graphql'
import {GQLContext} from '../graphql'

const UserFeatureFlags = new GraphQLObjectType<any, GQLContext>({
  name: 'UserFeatureFlags',
  description: 'The user account profile',
  fields: () => ({
    video: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the user has access to retro meeting video',
      resolve: ({video}) => !!video
    },
    jira: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if jira is allowed',
      resolve: ({jira}) => !!jira
    }
  })
})

export default UserFeatureFlags
