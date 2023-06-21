import {ReflectTemplateResolvers} from '../resolverTypes'

const ReflectTemplate: ReflectTemplateResolvers = {
  __isTypeOf: ({type}) => type === 'retrospective',
  prompts: async ({id: templateId}, _args, {dataLoader}) => {
    const prompts = await dataLoader.get('reflectPromptsByTemplateId').load(templateId)
    return prompts
      .filter((prompt) => !prompt.removedAt)
      .sort((a, b) => (a.sortOrder < b.sortOrder ? -1 : 1))
  }
}

export default ReflectTemplate
