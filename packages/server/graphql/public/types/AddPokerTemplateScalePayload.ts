import type {AddPokerTemplateScalePayloadResolvers} from '../resolverTypes'

export type AddPokerTemplateScalePayloadSource =
  | {
      scaleId: string
    }
  | {error: {message: string}}

const AddPokerTemplateScalePayload: AddPokerTemplateScalePayloadResolvers = {
  scale: (source, _args, {dataLoader}) => {
    if ('scaleId' in source) {
      return dataLoader.get('templateScales').loadNonNull(source.scaleId)
    }
    return null
  }
}

export default AddPokerTemplateScalePayload
