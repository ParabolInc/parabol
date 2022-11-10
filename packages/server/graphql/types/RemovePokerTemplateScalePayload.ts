import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import StandardMutationError from './StandardMutationError'
import TemplateDimension from './TemplateDimension'
import TemplateScale from './TemplateScale'

const RemovePokerTemplateScalePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'RemovePokerTemplateScalePayload',
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
    },
    dimensions: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TemplateDimension))),
      description: 'A list of dimensions that were using the archived scale'
    }
  })
})

export default RemovePokerTemplateScalePayload
