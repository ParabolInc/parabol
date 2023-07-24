import {PokerTemplateResolvers} from '../resolverTypes'

const PokerTemplate: PokerTemplateResolvers = {
  __isTypeOf: ({type}) => type === 'poker',
  dimensions: async ({id: templateId}, _args, {dataLoader}) => {
    const dimensions = await dataLoader.get('templateDimensionsByTemplateId').load(templateId)
    return dimensions.filter(({removedAt}) => !removedAt)
  }
}

export default PokerTemplate
