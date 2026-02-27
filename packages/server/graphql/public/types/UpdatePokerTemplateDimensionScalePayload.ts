import type {UpdatePokerTemplateDimensionScalePayloadResolvers} from '../resolverTypes'

export type UpdatePokerTemplateDimensionScalePayloadSource =
  | {dimensionId: string}
  | {error: {message: string}}

const UpdatePokerTemplateDimensionScalePayload: UpdatePokerTemplateDimensionScalePayloadResolvers =
  {
    dimension: async (source, _args, {dataLoader}) => {
      if ('error' in source) return null
      return (await dataLoader.get('templateDimensions').load(source.dimensionId)) ?? null
    }
  }

export default UpdatePokerTemplateDimensionScalePayload
