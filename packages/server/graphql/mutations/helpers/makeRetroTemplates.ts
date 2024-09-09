import {positionAfter} from '../../../../client/shared/sortOrder'
import ReflectTemplate from '../../../database/types/ReflectTemplate'
import generateUID from '../../../generateUID'
import {ReflectPrompt} from '../../../postgres/types'
import getTemplateIllustrationUrl from './getTemplateIllustrationUrl'

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
  const reflectPrompts: ReflectPrompt[] = []
  const templates: ReflectTemplate[] = []
  Object.entries(templateObj).forEach(([templateName, promptBase]) => {
    const template = new ReflectTemplate({
      name: templateName,
      teamId,
      orgId,
      illustrationUrl: getTemplateIllustrationUrl('gladSadMadTemplate.png'),
      mainCategory: 'retrospective'
    })

    let curSortOrder = positionAfter('')
    const prompts = promptBase.map((prompt) => {
      curSortOrder = positionAfter(curSortOrder)
      return {
        id: generateUID(),
        teamId,
        templateId: template.id,
        sortOrder: curSortOrder,
        question: prompt.question,
        description: prompt.description,
        groupColor: prompt.groupColor,
        removedAt: null,
        parentPromptId: null,
        // can remove these after phase 3
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    templates.push(template)
    reflectPrompts.push(...prompts)
  })
  return {reflectPrompts, templates}
}

export default makeRetroTemplates
