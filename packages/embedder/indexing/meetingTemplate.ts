import {DataLoaderInstance} from 'parabol-server/dataloader/RootDataLoader'
import MeetingTemplate from '../../server/database/types/MeetingTemplate'
import PokerTemplate from '../../server/database/types/PokerTemplate'
import ReflectTemplate from '../../server/database/types/ReflectTemplate'
import {inferLanguage} from '../inferLanguage'

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
  return `${template.name}\nRetrospective\n${promptText}`
}

const createTextFromTeamPromptMeetingTemplate = async (template: MeetingTemplate) => {
  return `${template.name}\nteam prompt, daily standup, status update`
}

const createTextFromActionMeetingTemplate = async (template: MeetingTemplate) => {
  return `${template.name}\ncheck-in, action, task, todo, follow-up`
}

const createTextFromPokerMeetingTemplate = async (
  template: PokerTemplate,
  dataLoader: DataLoaderInstance
) => {
  const dimensions = await dataLoader.get('templateDimensionsByTemplateId').load(template.id)
  const dimensionsText = (
    await Promise.all(
      dimensions.map(async ({name, description, scaleId}) => {
        const scale = await dataLoader.get('templateScales').load(scaleId)
        const scaleValues = scale.values.map(({label}) => label).join(', ')
        return `${name}\n${description}\n${scale.name}\n${scaleValues}`
      })
    )
  ).join('\n')
  return `${template.name}\nplanning poker, sprint poker, estimation\n${dimensionsText}`
}

export const createTextFromMeetingTemplate = async (
  templateId: string,
  dataLoader: DataLoaderInstance
) => {
  const template = await dataLoader.get('meetingTemplates').load(templateId)
  const body = await (() => {
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
        return ''
    }
  })()

  const language = inferLanguage(body)
  return {body, language}
}
