import {RecordSourceSelectorProxy} from 'relay-runtime'
import pluralizeHandler from './pluralizeHandler'
import removeFromRefs from '../../utils/relay/removeFromRefs'

const handleRemoveReflectTemplatePrompt = (promptId: string, store: RecordSourceSelectorProxy) => {
  store.delete(promptId)
  removeFromRefs(promptId, store, {ReflectTemplate: ['prompts']})
}

const handleRemoveReflectTemplatePrompts = pluralizeHandler(handleRemoveReflectTemplatePrompt)
export default handleRemoveReflectTemplatePrompts
