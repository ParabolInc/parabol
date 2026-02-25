import type {MovePokerTemplateScaleValueSuccessResolvers} from '../resolverTypes'

export type MovePokerTemplateScaleValueSuccessSource = {
  scaleId: string
}

const MovePokerTemplateScaleValueSuccess: MovePokerTemplateScaleValueSuccessResolvers = {
  scale: ({scaleId}, _args, {dataLoader}) => {
    return dataLoader.get('templateScales').loadNonNull(scaleId)
  }
}

export default MovePokerTemplateScaleValueSuccess
