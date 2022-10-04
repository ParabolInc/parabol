import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import StandardMutationError from './StandardMutationError'
import TemplateScale from './TemplateScale'

const RenamePokerTemplateScalePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'RenamePokerTemplateScalePayload',
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

export default RenamePokerTemplateScalePayload
