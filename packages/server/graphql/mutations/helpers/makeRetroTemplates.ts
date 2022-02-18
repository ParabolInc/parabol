import ReflectTemplate from '../../../database/types/ReflectTemplate'
import RetrospectivePrompt from '../../../database/types/RetrospectivePrompt'

interface TemplatePrompt {
  description: string
  groupColor: string
  question: string
  scope?: string
}

interface TemplateObject {
  [templateName: string]: readonly [TemplatePrompt, ...TemplatePrompt[]]
}

const makeRetroTemplates = (teamId: string, orgId: string, templateObj: TemplateObject) => {
  const reflectPrompts: RetrospectivePrompt[] = []
  const templates: ReflectTemplate[] = []
  Object.entries(templateObj).forEach(([templateName, promptBase]) => {
    const template = new ReflectTemplate({name: templateName, teamId, orgId})

    const prompts = promptBase.map(
      (prompt, idx) =>
        new RetrospectivePrompt({
          teamId,
          templateId: template.id,
          sortOrder: idx,
          question: prompt.question,
          description: prompt.description,
          groupColor: prompt.groupColor,
          removedAt: null
        })
    )
    templates.push(template)
    reflectPrompts.push(...prompts)
  })
  return {reflectPrompts, templates}
}

export default makeRetroTemplates
