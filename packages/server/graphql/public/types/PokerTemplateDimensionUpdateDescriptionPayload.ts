import type {PokerTemplateDimensionUpdateDescriptionPayloadResolvers} from '../resolverTypes'

export type PokerTemplateDimensionUpdateDescriptionPayloadSource = {dimensionId: string}

const PokerTemplateDimensionUpdateDescriptionPayload: PokerTemplateDimensionUpdateDescriptionPayloadResolvers =
  {
    dimension: async (source, _args, {dataLoader}) => {
      return dataLoader.get('templateDimensions').loadNonNull(source.dimensionId)
    }
  }

export default PokerTemplateDimensionUpdateDescriptionPayload
