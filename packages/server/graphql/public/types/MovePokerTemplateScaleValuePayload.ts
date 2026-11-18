import type {MovePokerTemplateScaleValuePayloadResolvers} from '../resolverTypes'

export type MovePokerTemplateScaleValuePayloadSource = {
  scaleId: string
}

const MovePokerTemplateScaleValuePayload: MovePokerTemplateScaleValuePayloadResolvers = {
  scale: ({scaleId}, _args, {dataLoader}) => {
    return dataLoader.get('templateScales').loadNonNull(scaleId)
  }
}

export default MovePokerTemplateScaleValuePayload
