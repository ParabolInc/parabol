import {GraphQLObjectType} from 'graphql'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import User from './User'

const DismissNewFeaturePayload = new GraphQLObjectType({
  name: 'DismissNewFeaturePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    user: {
      type: User,
      description: 'a piece of the user doc including the now-empty newFeatureId'
    }
  })
})

export default DismissNewFeaturePayload
