import TemplateDimensionRefId from '../../../../client/shared/gqlIds/TemplateDimensionRefId'
import {TemplateDimensionRefResolvers} from '../resolverTypes'

const TemplateDimensionRef: TemplateDimensionRefResolvers = {
  id: ({meetingId, dimensionRefIdx}) => TemplateDimensionRefId.join(meetingId, dimensionRefIdx),

  sortOrder: ({dimensionRefIdx}) => dimensionRefIdx,

  scale: async ({scaleRefId}, _args, {dataLoader}) => {
    const scaleFromPg = await dataLoader.get('templateScaleRefs').loadNonNull(scaleRefId)
    return scaleFromPg
  }
}

export default TemplateDimensionRef
