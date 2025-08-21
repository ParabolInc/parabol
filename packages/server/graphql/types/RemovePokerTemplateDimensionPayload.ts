import {GraphQLObjectType} from 'graphql'
import type {GQLContext} from '../graphql'
import PokerTemplate from './PokerTemplate'
import StandardMutationError from './StandardMutationError'
import TemplateDimension from './TemplateDimension'

const RemovePokerTemplateDimensionPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'RemovePokerTemplateDimensionPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    pokerTemplate: {
      type: PokerTemplate,
      resolve: ({templateId}, _args: unknown, {dataLoader}) => {
        if (!templateId) return null
        return dataLoader.get('meetingTemplates').load(templateId)
      }
    },
    dimension: {
      type: TemplateDimension
    }
  })
})

export default RemovePokerTemplateDimensionPayload
