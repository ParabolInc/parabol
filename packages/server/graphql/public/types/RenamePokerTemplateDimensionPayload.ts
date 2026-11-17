import type {RenamePokerTemplateDimensionPayloadResolvers} from '../resolverTypes'

export type RenamePokerTemplateDimensionPayloadSource = {dimensionId: string}

const RenamePokerTemplateDimensionPayload: RenamePokerTemplateDimensionPayloadResolvers = {
  dimension: (source, _args, {dataLoader}) => {
    return dataLoader.get('templateDimensions').loadNonNull(source.dimensionId)
  }
}

export default RenamePokerTemplateDimensionPayload
