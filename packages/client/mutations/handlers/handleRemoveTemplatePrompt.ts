import type {RecordSourceSelectorProxy} from 'relay-runtime'
import safeRemoveNodeFromArray from '~/utils/relay/safeRemoveNodeFromArray'
import pluralizeHandler from './pluralizeHandler'

const handleRemoveTemplatePrompt = (
  promptId: string,
  templateId: string,
  store: RecordSourceSelectorProxy
) => {
  const template = store.get(templateId)
  if (!template) return
  safeRemoveNodeFromArray(promptId, template, 'prompts')
}

const handleRemoveTemplatePrompts = pluralizeHandler(handleRemoveTemplatePrompt)
export default handleRemoveTemplatePrompts
