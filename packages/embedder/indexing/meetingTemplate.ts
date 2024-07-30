import {DataLoaderInstance} from 'parabol-server/dataloader/RootDataLoader'
import MeetingTemplate from '../../server/database/types/MeetingTemplate'
import PokerTemplate from '../../server/database/types/PokerTemplate'
import ReflectTemplate from '../../server/database/types/ReflectTemplate'
import {inferLanguage} from '../inferLanguage'

const MIN_TEXT_LENGTH = 10

const createTextFromRetrospectiveMeetingTemplate = async (
  template: ReflectTemplate,
  dataLoader: DataLoaderInstance
) => {
  const prompts = await dataLoader.get('reflectPromptsByTemplateId').load(template.id)
  const promptText = prompts
    .map(({question, description}) => {
      return `${question}\n${description}`
    })
    .join('\n')
  const body = `${template.name}\nRetrospective\n${promptText}`
  const language = inferLanguage(`${template.name}\n${promptText}`, MIN_TEXT_LENGTH)
  return {body, language}
}

const createTextFromTeamPromptMeetingTemplate = async (template: MeetingTemplate) => {
  const body = `${template.name}\nteam prompt, daily standup, status update`
  const language = inferLanguage(template.name, MIN_TEXT_LENGTH)
  return {body, language}
}

const createTextFromActionMeetingTemplate = async (template: MeetingTemplate) => {
  const body = `${template.name}\ncheck-in, action, task, todo, follow-up`
  const language = inferLanguage(template.name, MIN_TEXT_LENGTH)
  return {body, language}
}

const createTextFromPokerMeetingTemplate = async (
  template: PokerTemplate,
  dataLoader: DataLoaderInstance
) => {
  const dimensions = await dataLoader.get('templateDimensionsByTemplateId').load(template.id)
  const dimensionsText = (
    await Promise.all(
      dimensions.map(async ({name, description, scaleId}) => {
        const scale = await dataLoader.get('templateScales').loadNonNull(scaleId)
        const scaleValues = scale.values.map(({label}) => label).join(', ')
        return `${name}\n${description ?? ''}\n${scale.name}\n${scaleValues}`
      })
    )
  ).join('\n')
  const body = `${template.name}\nplanning poker, sprint poker, estimation\n${dimensionsText}`
  const language = inferLanguage(`${template.name}\n${dimensionsText}`, MIN_TEXT_LENGTH)
  return {body, language}
}

export const createTextFromMeetingTemplate = async (
  templateId: string,
  dataLoader: DataLoaderInstance
) => {
  const template = await dataLoader.get('meetingTemplates').load(templateId)
  switch (template?.type) {
    case 'retrospective':
      return createTextFromRetrospectiveMeetingTemplate(template, dataLoader)
    case 'teamPrompt':
      return createTextFromTeamPromptMeetingTemplate(template)
    case 'action':
      return createTextFromActionMeetingTemplate(template)
    case 'poker':
      return createTextFromPokerMeetingTemplate(template, dataLoader)
    default:
      return {body: '', language: undefined}
  }
}
