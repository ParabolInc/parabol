import type {MeetingTemplate} from '../../../postgres/types'
import type {DataLoaderWorker} from '../../graphql'
import promptTemplateRules, {
  type PromptTemplateType
} from '../../public/mutations/helpers/promptTemplateRules'

const getValidPromptTemplateId = async (
  templateId: string | null | undefined,
  type: PromptTemplateType,
  dataLoader: DataLoaderWorker
) => {
  const loadTemplate = async (id: string | null | undefined) =>
    id ? dataLoader.get('meetingTemplates').load(id) : undefined
  const isValid = async (template: MeetingTemplate | undefined) => {
    if (!template?.isActive || template.type !== type) return false
    const prompts = await dataLoader.get('templatePromptsByTemplateId').load(template.id)
    return prompts.length > 0
  }
  const getClosestParabolTemplate = async (
    template: MeetingTemplate | undefined
  ): Promise<MeetingTemplate | undefined> =>
    !template || template.teamId === 'aGhostTeam'
      ? template
      : getClosestParabolTemplate(await loadTemplate(template.parentTemplateId))

  const template = await loadTemplate(templateId)
  if (template && (await isValid(template))) return template.id
  const parabolTemplate = await getClosestParabolTemplate(template)
  if (parabolTemplate && (await isValid(parabolTemplate))) return parabolTemplate.id
  return promptTemplateRules[type].defaultTemplateId
}

export default getValidPromptTemplateId
