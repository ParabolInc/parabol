import type {AddPokerTemplateScaleValuePayloadResolvers} from '../resolverTypes'

export type AddPokerTemplateScaleValuePayloadSource =
  | {
      scaleId: string
    }
  | {error: {message: string}}

const AddPokerTemplateScaleValuePayload: AddPokerTemplateScaleValuePayloadResolvers = {
  scale: (source, _args, {dataLoader}) => {
    if ('scaleId' in source) {
      return dataLoader.get('templateScales').loadNonNull(source.scaleId)
    }
    return null
  }
}

export default AddPokerTemplateScaleValuePayload
