import type {RenamePokerTemplateScalePayloadResolvers} from '../resolverTypes'

export type RenamePokerTemplateScalePayloadSource = {scaleId: string} | {error: {message: string}}

const RenamePokerTemplateScalePayload: RenamePokerTemplateScalePayloadResolvers = {
  scale: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('templateScales').loadNonNull(source.scaleId)
  }
}

export default RenamePokerTemplateScalePayload
