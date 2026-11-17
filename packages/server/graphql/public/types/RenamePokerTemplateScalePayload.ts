import type {RenamePokerTemplateScalePayloadResolvers} from '../resolverTypes'

export type RenamePokerTemplateScalePayloadSource = {scaleId: string}

const RenamePokerTemplateScalePayload: RenamePokerTemplateScalePayloadResolvers = {
  scale: (source, _args, {dataLoader}) => {
    return dataLoader.get('templateScales').loadNonNull(source.scaleId)
  }
}

export default RenamePokerTemplateScalePayload
