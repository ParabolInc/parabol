import {PokerTemplateResolvers} from '../resolverTypes'
import {getIllustrationUrlForActivity} from './helpers/getIllustrationUrlForActivity'

const PokerTemplate: PokerTemplateResolvers = {
  __isTypeOf: ({type}) => type === 'poker',
  illustrationUrl: async ({id: templateId, illustrationUrl}) => {
    if (illustrationUrl) {
      return illustrationUrl
    }
    return getIllustrationUrlForActivity(templateId)
  },
  dimensions: async ({id: templateId}, _args, {dataLoader}) => {
    const dimensions = await dataLoader.get('templateDimensionsByTemplateId').load(templateId)
    return dimensions.filter(({removedAt}) => !removedAt)
  }
}

export default PokerTemplate
