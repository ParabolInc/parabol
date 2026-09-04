import type {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'

export const CANONICAL_STANDUP_TEMPLATE_ID = 'teamPrompt'

const resolveStandupTemplateId = async (
  candidateIds: (string | null | undefined)[],
  dataLoader: DataLoaderWorker
) => {
  const ids = candidateIds.filter((id): id is string => !!id)
  if (ids.length === 0) return CANONICAL_STANDUP_TEMPLATE_ID
  const templates = (await dataLoader.get('meetingTemplates').loadMany(ids)).filter(isValid)
  const activeTemplate = ids
    .map((id) => templates.find((template) => template.id === id))
    .find((template) => template?.isActive && template.type === 'teamPrompt')
  return activeTemplate?.id ?? CANONICAL_STANDUP_TEMPLATE_ID
}

export default resolveStandupTemplateId
