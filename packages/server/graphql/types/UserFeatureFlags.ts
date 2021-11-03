import {GraphQLBoolean, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'

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
      description: 'true if jira is allowed',
      resolve: ({poker}) => !!poker
    }
  })
})

export default UserFeatureFlags
