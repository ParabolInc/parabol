import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import StandardMutationError from './StandardMutationError'

const DismissNewFeaturePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'DismissNewFeaturePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    }
  })
})

export default DismissNewFeaturePayload
