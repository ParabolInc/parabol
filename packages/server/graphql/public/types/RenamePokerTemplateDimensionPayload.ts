import type {RenamePokerTemplateDimensionPayloadResolvers} from '../resolverTypes'

export type RenamePokerTemplateDimensionPayloadSource =
  | {dimensionId: string}
  | {error: {message: string}}

const RenamePokerTemplateDimensionPayload: RenamePokerTemplateDimensionPayloadResolvers = {
  dimension: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('templateDimensions').loadNonNull(source.dimensionId)
  }
}

export default RenamePokerTemplateDimensionPayload
