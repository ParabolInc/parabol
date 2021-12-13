import {GraphQLBoolean, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'

const UserFeatureFlags = new GraphQLObjectType<any, GQLContext>({
  name: 'UserFeatureFlags',
  description: 'The types of flags that give an individual user super powers',
  fields: () => ({
    spotlight: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if spotlight is allowed',
      resolve: ({spotlight}) => !!spotlight
    },
    standups: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if standups is allowed',
      resolve: ({standups}) => !!standups
    },
    gitlab: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if gitlab is allowed',
      resolve: ({gitlab}) => !!gitlab
    }
  })
})

export default UserFeatureFlags
