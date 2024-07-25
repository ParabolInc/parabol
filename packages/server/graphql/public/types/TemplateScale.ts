import {TemplateScaleResolvers} from '../resolverTypes'

const TemplateScale: TemplateScaleResolvers = {
  isActive: ({removedAt}) => !removedAt,
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  },

  dimensions: async ({id: scaleId}, _args, {dataLoader}) => {
    return dataLoader.get('templateDimensionsByScaleId').load(scaleId)
  },

  values: ({id, values}) => {
    return values.map((value, index) => ({
      ...value,
      scaleId: id,
      sortOrder: index
    }))
  }
}

export default TemplateScale
