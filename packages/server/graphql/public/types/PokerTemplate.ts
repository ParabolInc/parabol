import {PokerTemplateResolvers} from '../resolverTypes'

const RECOMMENDED_TEMPLATES = ['estimatedEffortTemplate']

const PokerTemplate: PokerTemplateResolvers = {
  category: (_source, _args, _context) => {
    return 'estimation'
  },
  isRecommended: ({id}, _args, _context) => {
    return RECOMMENDED_TEMPLATES.includes(id)
  }
}

export default PokerTemplate
