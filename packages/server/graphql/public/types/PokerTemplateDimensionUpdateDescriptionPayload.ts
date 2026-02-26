import type {PokerTemplateDimensionUpdateDescriptionPayloadResolvers} from '../resolverTypes'

export type PokerTemplateDimensionUpdateDescriptionPayloadSource =
  | {dimensionId: string}
  | {error: {message: string}}

const PokerTemplateDimensionUpdateDescriptionPayload: PokerTemplateDimensionUpdateDescriptionPayloadResolvers =
  {
    dimension: async (source, _args, {dataLoader}) => {
      if ('error' in source) return null
      return dataLoader.get('templateDimensions').loadNonNull(source.dimensionId)
    }
  }

export default PokerTemplateDimensionUpdateDescriptionPayload
