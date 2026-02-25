import type {MovePokerTemplateDimensionPayloadResolvers} from '../resolverTypes'

export type MovePokerTemplateDimensionPayloadSource =
  | {dimensionId: string}
  | {error: {message: string}}

const MovePokerTemplateDimensionPayload: MovePokerTemplateDimensionPayloadResolvers = {
  dimension: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return (await dataLoader.get('templateDimensions').load(source.dimensionId)) ?? null
  }
}

export default MovePokerTemplateDimensionPayload
