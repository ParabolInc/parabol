import {RecordSourceSelectorProxy} from 'relay-runtime'
import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler'
import removeFromRefs from 'universal/utils/relay/removeFromRefs'

const handleRemoveReflectTemplatePrompt = (promptId: string, store: RecordSourceSelectorProxy) => {
  store.delete(promptId)
  removeFromRefs(promptId, store, {ReflectTemplate: ['prompts']})
}

const handleRemoveReflectTemplatePrompts = pluralizeHandler(handleRemoveReflectTemplatePrompt)
export default handleRemoveReflectTemplatePrompts
