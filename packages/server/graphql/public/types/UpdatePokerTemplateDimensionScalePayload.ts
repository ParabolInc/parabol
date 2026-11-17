import type {UpdatePokerTemplateDimensionScalePayloadResolvers} from '../resolverTypes'

export type UpdatePokerTemplateDimensionScalePayloadSource = {dimensionId: string}

const UpdatePokerTemplateDimensionScalePayload: UpdatePokerTemplateDimensionScalePayloadResolvers =
  {
    dimension: async (source, _args, {dataLoader}) => {
      return (await dataLoader.get('templateDimensions').load(source.dimensionId)) ?? null
    }
  }

export default UpdatePokerTemplateDimensionScalePayload
