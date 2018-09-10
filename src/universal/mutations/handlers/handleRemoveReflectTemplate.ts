import {RecordSourceSelectorProxy} from 'relay-runtime'
import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler'
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray'
import getCachedRecord from '../../utils/relay/getCachedRecord'

const handleRemoveReflectTemplate = (templateId: string, store: RecordSourceSelectorProxy) => {
  const filterFn = (obj) => {
    return (
      obj.__typename === 'RetrospectiveMeetingSettings' &&
      obj.reflectTemplates.__refs.includes(templateId)
    )
  }
  const settingsRecord = getCachedRecord(store, filterFn)
  if (!settingsRecord || Array.isArray(settingsRecord)) return
  const settings = store.get(settingsRecord.__id)
  if (!settings) return
  const selectedTemplateId = settings.getValue('selectedTemplateId')
  if (selectedTemplateId === templateId) {
    const templates = settings.getLinkedRecords('reflectTemplates')
    if (!templates) return
    const nextTemplate = templates.find((template) =>
      Boolean(template && template.getValue('id') !== templateId)
    )!
    settings.setValue(nextTemplate.getValue('id'), 'selectedTemplateId')
  }
  safeRemoveNodeFromArray(templateId, settings, 'reflectTemplates')
}

const handleRemoveReflectTemplates = pluralizeHandler(handleRemoveReflectTemplate)
export default handleRemoveReflectTemplates
