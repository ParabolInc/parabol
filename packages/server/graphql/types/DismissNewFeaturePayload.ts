import {GraphQLObjectType} from 'graphql'
import StandardMutationError from './StandardMutationError'

const DismissNewFeaturePayload = new GraphQLObjectType({
  name: 'DismissNewFeaturePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    }
  })
})

export default DismissNewFeaturePayload
