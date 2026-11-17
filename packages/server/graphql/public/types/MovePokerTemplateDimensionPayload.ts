import type {MovePokerTemplateDimensionPayloadResolvers} from '../resolverTypes'

export type MovePokerTemplateDimensionPayloadSource = {dimensionId: string}

const MovePokerTemplateDimensionPayload: MovePokerTemplateDimensionPayloadResolvers = {
  dimension: async (source, _args, {dataLoader}) => {
    return (await dataLoader.get('templateDimensions').load(source.dimensionId)) ?? null
  }
}

export default MovePokerTemplateDimensionPayload
