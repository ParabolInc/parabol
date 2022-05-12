import {GraphQLBoolean, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'

const UserFeatureFlags = new GraphQLObjectType<any, GQLContext>({
  name: 'UserFeatureFlags',
  description: 'The types of flags that give an individual user super powers',
  fields: () => ({
    standups: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if standups is allowed',
      resolve: ({standups}) => !!standups
    },
    azureDevOps: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if azureDevOps is allowed',
      resolve: ({azureDevOps}) => !!azureDevOps
    }
  })
})

export default UserFeatureFlags
