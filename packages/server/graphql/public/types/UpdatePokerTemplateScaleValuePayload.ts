import type {UpdatePokerTemplateScaleValuePayloadResolvers} from '../resolverTypes'

export type UpdatePokerTemplateScaleValuePayloadSource = {scaleId: string}

const UpdatePokerTemplateScaleValuePayload: UpdatePokerTemplateScaleValuePayloadResolvers = {
  scale: (source, _args, {dataLoader}) => {
    return dataLoader.get('templateScales').loadNonNull(source.scaleId)
  }
}

export default UpdatePokerTemplateScaleValuePayload
