import type {TemplateDimension as TemplateDimensionDB} from '../../../postgres/types'
import type {RemovePokerTemplateScalePayloadResolvers} from '../resolverTypes'

export type RemovePokerTemplateScalePayloadSource = {
  scaleId: string
  dimensions: TemplateDimensionDB[]
  teamId: string
}

const RemovePokerTemplateScalePayload: RemovePokerTemplateScalePayloadResolvers = {
  scale: (source, _args, {dataLoader}) => {
    return dataLoader.get('templateScales').loadNonNull(source.scaleId)
  },
  dimensions: (source) => {
    return source.dimensions
  },
  team: (source, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(source.teamId)
  }
}

export default RemovePokerTemplateScalePayload
