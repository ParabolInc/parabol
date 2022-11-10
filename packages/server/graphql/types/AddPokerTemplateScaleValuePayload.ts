import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import StandardMutationError from './StandardMutationError'
import TemplateScale from './TemplateScale'

const AddPokerTemplateScaleValuePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AddPokerTemplateScaleValuePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    scale: {
      type: TemplateScale,
      resolve: ({scaleId}, _args: unknown, {dataLoader}) => {
        if (!scaleId) return null
        return dataLoader.get('templateScales').load(scaleId)
      }
    }
  })
})

export default AddPokerTemplateScaleValuePayload
