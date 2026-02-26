import type {UpdatePokerTemplateScaleValuePayloadResolvers} from '../resolverTypes'

export type UpdatePokerTemplateScaleValuePayloadSource =
  | {scaleId: string}
  | {error: {message: string}}

const UpdatePokerTemplateScaleValuePayload: UpdatePokerTemplateScaleValuePayloadResolvers = {
  scale: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('templateScales').loadNonNull(source.scaleId)
  }
}

export default UpdatePokerTemplateScaleValuePayload
