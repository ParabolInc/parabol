import {getUserId} from '../../../utils/authorization'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import standardError from '../../../utils/standardError'
import isValid from '../../isValid'
import {MutationResolvers} from '../resolverTypes'

type Prompt = {
  question: string
  description: string
}

type PromptsByTemplate = {
  [templateId: string]: Prompt[]
}

const getTemplateSuggestion: MutationResolvers['getTemplateSuggestion'] = async (
  _source,
  {prompt},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(viewerId)
  const userOrgIds = organizationUsers.map(({orgId}) => orgId)
  const availableOrgIds = ['aGhostOrg', ...userOrgIds]
  const allTemplates = (await dataLoader.get('meetingTemplatesByOrgId').loadMany(availableOrgIds))
    .filter(isValid)
    .flat()

  const templateIds = allTemplates.map((template) => template.id)
  const prompts = (await dataLoader.get('reflectPromptsByTemplateId').loadMany(templateIds))
    .filter(isValid)
    .flat()

  const promptsByTemplate: PromptsByTemplate = {}
  prompts.forEach((prompt) => {
    const {templateId} = prompt
    if (!promptsByTemplate[templateId]) {
      promptsByTemplate[templateId] = []
    }
    promptsByTemplate[templateId]!.push({
      question: prompt.question,
      description: prompt.description
    })
  })

  const templatesWithPrompts = allTemplates.map((template) => ({
    templateId: template.id,
    templateName: template.name,
    prompts: promptsByTemplate[template.id] || []
  }))

  const manager = new OpenAIServerManager()
  const templateRes = await manager.getTemplateSuggestion(templatesWithPrompts, prompt)
  if (!templateRes) {
    return standardError(new Error('Unable to get AI suggested template'), {userId: viewerId})
  }

  const data = {
    suggestedTemplateId: templateRes.templateId,
    explanation: templateRes.explanation
  }
  return data
}

export default getTemplateSuggestion
