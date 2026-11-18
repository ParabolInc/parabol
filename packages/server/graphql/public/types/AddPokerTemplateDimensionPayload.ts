import type {AddPokerTemplateDimensionPayloadResolvers} from '../resolverTypes'

export type AddPokerTemplateDimensionPayloadSource = {
  dimensionId: string
}

const AddPokerTemplateDimensionPayload: AddPokerTemplateDimensionPayloadResolvers = {
  dimension: (source, _args, {dataLoader}) => {
    if ('dimensionId' in source) {
      return dataLoader.get('templateDimensions').loadNonNull(source.dimensionId)
    }
    return null
  }
}

export default AddPokerTemplateDimensionPayload
