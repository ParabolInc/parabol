import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import addNodeToArray from '../../utils/relay/addNodeToArray'

const handleAddReflectTemplatePrompt = (
  newNode: RecordProxy | null,
  store: RecordSourceSelectorProxy
) => {
  if (!newNode) return
  const templateId = newNode.getValue('templateId') as string
  const template = store.get(templateId)
  addNodeToArray(newNode, template, 'prompts', 'sortOrder')
}

export default handleAddReflectTemplatePrompt
