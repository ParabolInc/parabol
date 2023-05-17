import {ReflectTemplateResolvers} from '../resolverTypes'

type ReflectCategory = 'retrospective' | 'strategy' | 'feedback'

const ID_TO_CATEGORY_MAPPING: Record<string, ReflectCategory> = {
  teamCharterTemplate: 'strategy',
  sWOTAnalysisTemplate: 'strategy',
  teamRetreatPlanningTemplate: 'strategy',
  questionsCommentsConcernsTemplate: 'feedback'
}

const RECOMMENDED_TEMPLATES = ['teamCharterTemplate', 'startStopContinueTemplate']

const ReflectTemplate: ReflectTemplateResolvers = {
  category: ({id}, _args, _context): ReflectCategory => {
    return ID_TO_CATEGORY_MAPPING[id] ?? 'retrospective'
  },
  isRecommended: ({id}, _args, _context) => {
    return RECOMMENDED_TEMPLATES.includes(id)
  }
}

export default ReflectTemplate
