import type {TemplateDimension as TemplateDimensionDB} from '../../../postgres/types'
import type {RemovePokerTemplateScalePayloadResolvers} from '../resolverTypes'

export type RemovePokerTemplateScalePayloadSource =
  | {scaleId: string; dimensions: TemplateDimensionDB[]}
  | {error: {message: string}}

const RemovePokerTemplateScalePayload: RemovePokerTemplateScalePayloadResolvers = {
  scale: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('templateScales').loadNonNull(source.scaleId)
  },
  dimensions: (source) => {
    if ('error' in source) return null
    return source.dimensions
  }
}

export default RemovePokerTemplateScalePayload
