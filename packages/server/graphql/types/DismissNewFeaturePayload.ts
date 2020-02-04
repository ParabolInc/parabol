import {GraphQLObjectType} from 'graphql'
import StandardMutationError from './StandardMutationError'
import {GQLContext} from '../graphql'

const DismissNewFeaturePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'DismissNewFeaturePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    }
  })
})

export default DismissNewFeaturePayload
