import type {DataLoaderWorker} from '../../graphql'
import promptTemplateRules from '../../public/mutations/helpers/promptTemplateRules'

const getActiveStandupTemplateId = async (
  templateId: string | null,
  dataLoader: DataLoaderWorker
) => {
  const {defaultTemplateId} = promptTemplateRules.teamPrompt
  if (!templateId) return defaultTemplateId
  const template = await dataLoader.get('meetingTemplates').load(templateId)
  return template?.isActive && template.type === 'teamPrompt' ? templateId : defaultTemplateId
}

export default getActiveStandupTemplateId
