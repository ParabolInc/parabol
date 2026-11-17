import type {RemovePokerTemplateScaleValuePayloadResolvers} from '../resolverTypes'

export type RemovePokerTemplateScaleValuePayloadSource = {scaleId: string}

const RemovePokerTemplateScaleValuePayload: RemovePokerTemplateScaleValuePayloadResolvers = {
  scale: (source, _args, {dataLoader}) => {
    return dataLoader.get('templateScales').loadNonNull(source.scaleId)
  }
}

export default RemovePokerTemplateScaleValuePayload
