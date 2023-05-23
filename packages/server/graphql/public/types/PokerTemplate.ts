import {PokerTemplateResolvers} from '../resolverTypes'

const RECOMMENDED_TEMPLATES = ['estimatedEffortTemplate']

const PokerTemplate: PokerTemplateResolvers = {
  __isTypeOf: ({type}) => type === 'poker',
  category: ({mainCategory}, _args, _context) => mainCategory,
  dimensions: async ({id: templateId}, _args, {dataLoader}) => {
    const dimensions = await dataLoader.get('templateDimensionsByTemplateId').load(templateId)
    return dimensions.filter(({removedAt}) => !removedAt)
  },
  isRecommended: ({id}, _args, _context) => {
    return RECOMMENDED_TEMPLATES.includes(id)
  },
  team: async ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default PokerTemplate
