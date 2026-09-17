import type {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'
import promptTemplateRules from '../../public/mutations/helpers/promptTemplateRules'

const resolveStandupTemplateId = async (
  candidateIds: (string | null | undefined)[],
  dataLoader: DataLoaderWorker
) => {
  const {defaultTemplateId} = promptTemplateRules.teamPrompt
  const ids = candidateIds.filter((id): id is string => !!id)
  if (ids.length === 0) return defaultTemplateId
  const templates = (await dataLoader.get('meetingTemplates').loadMany(ids)).filter(isValid)
  const activeTemplate = ids
    .map((id) => templates.find((template) => template.id === id))
    .find((template) => template?.isActive && template.type === 'teamPrompt')
  return activeTemplate?.id ?? defaultTemplateId
}

export default resolveStandupTemplateId
