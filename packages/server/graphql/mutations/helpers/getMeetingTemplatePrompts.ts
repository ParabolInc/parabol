import type {DataLoaderWorker} from '../../graphql'

const getMeetingTemplatePrompts = async (
  meeting: {templateId: string | null; createdAt: Date},
  dataLoader: DataLoaderWorker
) => {
  const {templateId, createdAt} = meeting
  if (!templateId) return []
  const prompts = await dataLoader.get('templatePromptsByTemplateId').load(templateId)
  return prompts.filter(
    (prompt) => prompt.createdAt < createdAt && (!prompt.removedAt || createdAt < prompt.removedAt)
  )
}

export default getMeetingTemplatePrompts
