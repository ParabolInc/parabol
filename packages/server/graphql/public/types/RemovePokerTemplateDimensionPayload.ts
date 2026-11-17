import type {TemplateDimension as TemplateDimensionDB} from '../../../postgres/types'
import type {RemovePokerTemplateDimensionPayloadResolvers} from '../resolverTypes'

export type RemovePokerTemplateDimensionPayloadSource = {
  dimension: TemplateDimensionDB
  templateId: string
}

const RemovePokerTemplateDimensionPayload: RemovePokerTemplateDimensionPayloadResolvers = {
  pokerTemplate: async (source, _args, {dataLoader}) => {
    const template = await dataLoader.get('meetingTemplates').loadNonNull(source.templateId)
    return template.type === 'poker' ? template : null
  },
  dimension: (source) => {
    return source.dimension
  }
}

export default RemovePokerTemplateDimensionPayload
