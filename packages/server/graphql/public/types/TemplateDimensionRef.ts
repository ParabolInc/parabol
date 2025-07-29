import TemplateDimensionRefId from '../../../../client/shared/gqlIds/TemplateDimensionRefId'
import type {TemplateDimensionRefResolvers} from '../resolverTypes'

export interface TemplateDimensionRefSource {
  meetingId: string
  dimensionRefIdx: number
  scaleRefId: string
}

const TemplateDimensionRef: TemplateDimensionRefResolvers = {
  id: ({meetingId, dimensionRefIdx}) => TemplateDimensionRefId.join(meetingId, dimensionRefIdx),

  sortOrder: ({dimensionRefIdx}) => dimensionRefIdx,

  scale: async ({scaleRefId}, _args, {dataLoader}) => {
    const scaleFromPg = await dataLoader.get('templateScaleRefs').loadNonNull(scaleRefId)
    return scaleFromPg
  }
}

export default TemplateDimensionRef
