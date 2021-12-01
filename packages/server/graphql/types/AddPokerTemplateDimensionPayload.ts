import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import TemplateDimension from './TemplateDimension'
import StandardMutationError from './StandardMutationError'

const AddPokerTemplateDimensionPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AddPokerTemplateDimensionPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    dimension: {
      type: TemplateDimension,
      resolve: ({dimensionId}, _args: unknown, {dataLoader}) => {
        if (!dimensionId) return null
        return dataLoader.get('templateDimensions').load(dimensionId)
      }
    }
  })
})

export default AddPokerTemplateDimensionPayload
