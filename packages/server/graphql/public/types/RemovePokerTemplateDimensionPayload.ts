import type {TemplateDimension as TemplateDimensionDB} from '../../../postgres/types'
import type {RemovePokerTemplateDimensionPayloadResolvers} from '../resolverTypes'

export type RemovePokerTemplateDimensionPayloadSource =
  | {dimension: TemplateDimensionDB; templateId: string}
  | {error: {message: string}}

const RemovePokerTemplateDimensionPayload: RemovePokerTemplateDimensionPayloadResolvers = {
  pokerTemplate: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const template = await dataLoader.get('meetingTemplates').loadNonNull(source.templateId)
    return template.type === 'poker' ? template : null
  },
  dimension: (source) => {
    if ('error' in source) return null
    return source.dimension
  }
}

export default RemovePokerTemplateDimensionPayload
