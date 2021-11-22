import {GraphQLBoolean, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'

export type UserFeatureFlagEnum = 'jira' | 'poker' | 'spotlight'

const UserFeatureFlags = new GraphQLObjectType<any, GQLContext>({
  name: 'UserFeatureFlags',
  description: 'The user account profile',
  fields: () => ({
    jira: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if jira is allowed',
      resolve: ({jira}) => !!jira
    },
    poker: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if poker is allowed',
      resolve: ({poker}) => !!poker
    },
    spotlight: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if spotlight is allowed',
      resolve: ({spotlight}) => !!spotlight
    }
  })
})

export default UserFeatureFlags
