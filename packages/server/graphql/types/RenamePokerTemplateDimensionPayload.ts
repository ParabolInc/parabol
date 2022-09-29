import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import StandardMutationError from './StandardMutationError'
import TemplateDimension from './TemplateDimension'

const RenamePokerTemplateDimensionPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'RenamePokerTemplateDimensionPayload',
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

export default RenamePokerTemplateDimensionPayload
