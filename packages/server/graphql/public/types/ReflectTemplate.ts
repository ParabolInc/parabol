import {ReflectTemplateResolvers} from '../resolverTypes'

const RECOMMENDED_TEMPLATES = [
  'teamCharterTemplate',
  'startStopContinueTemplate',
  'incidentResponsePostmortemTemplate',
  'successAndFailurePremortemTemplate'
]

const ReflectTemplate: ReflectTemplateResolvers = {
  __isTypeOf: ({type}) => type === 'retrospective',
  category: ({mainCategory}, _args, _context) => mainCategory,
  isRecommended: ({id}, _args, _context) => {
    return RECOMMENDED_TEMPLATES.includes(id)
  },
  prompts: async ({id: templateId}, _args, {dataLoader}) => {
    const prompts = await dataLoader.get('reflectPromptsByTemplateId').load(templateId)
    return prompts
      .filter((prompt) => !prompt.removedAt)
      .sort((a, b) => (a.sortOrder < b.sortOrder ? -1 : 1))
  },
  team: async ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default ReflectTemplate
