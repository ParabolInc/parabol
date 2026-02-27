import type {RemovePokerTemplateScaleValuePayloadResolvers} from '../resolverTypes'

export type RemovePokerTemplateScaleValuePayloadSource =
  | {scaleId: string}
  | {error: {message: string}}

const RemovePokerTemplateScaleValuePayload: RemovePokerTemplateScaleValuePayloadResolvers = {
  scale: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('templateScales').loadNonNull(source.scaleId)
  }
}

export default RemovePokerTemplateScaleValuePayload
