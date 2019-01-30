import {GraphQLObjectType} from 'graphql'
import StandardMutationError from 'server/graphql/types/StandardMutationError'

const DismissNewFeaturePayload = new GraphQLObjectType({
  name: 'DismissNewFeaturePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    }
  })
})

export default DismissNewFeaturePayload
