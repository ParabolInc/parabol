import {getUserId} from '../../../utils/authorization'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import isValid from '../../isValid'
import {MutationResolvers} from '../resolverTypes'

type Template = {
  templateId: string
  templateName: string
  question: string
  description: string
}

type PromptByTemplate = {
  [templateId: string]: Template
}

type Prompt = {
  question: string
  description: string
}

type PromptsByTemplate = {
  [templateId: string]: Prompt[]
}

const getTemplateSuggestion: MutationResolvers['getTemplateSuggestion'] = async (
  _source,
  {prompt, teamId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const now = new Date()

  const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(viewerId)
  const userOrgIds = organizationUsers.map(({orgId}) => orgId)
  const availableOrgIds = ['aGhostOrg', ...userOrgIds]
  const allTemplates = (await dataLoader.get('meetingTemplatesByOrgId').loadMany(availableOrgIds))
    .filter(isValid)
    .flat()

  // VALIDATION
  // const templates = await dataLoader
  //   .get('meetingTemplatesByType')
  //   .load({meetingType: 'retrospective', teamId})
  const templateIds = allTemplates.map((template) => template.id)
  const prompts = (await dataLoader.get('reflectPromptsByTemplateId').loadMany(templateIds))
    .filter(isValid)
    .flat()
  // console.log('🚀 ~ templates:', templates)
  // console.log('🚀 ~ prompts:', prompts)
  const templates = prompts.map((prompt) => {
    const template = allTemplates.find((template) => template.id === prompt.templateId)
    return {
      templateId: template?.id,
      templateName: template?.name,
      question: prompt.question,
      description: prompt.description
    }
  })

  // Initialize an object to hold prompts by templateId
  const promptsByTemplate: PromptsByTemplate = {}

  // Organize prompts by their templateId
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

  // Combine each template with its associated prompts
  const templatesWithPrompts = allTemplates.map((template) => ({
    templateId: template.id,
    templateName: template.name,
    prompts: promptsByTemplate[template.id] || []
  }))

  // console.log('🚀 ~ templates:', templates)

  const manager = new OpenAIServerManager()
  const templateRes = await manager.getTemplateSuggestion(templatesWithPrompts, prompt)
  console.log('🚀 ~ templateRes:', templateRes)

  // RESOLUTION
  const data = {
    suggestedTemplateId: templateRes.templateId,
    explanation: templateRes.explanation
  }
  return data
}

export default getTemplateSuggestion
