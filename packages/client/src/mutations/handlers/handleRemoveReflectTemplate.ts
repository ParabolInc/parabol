import {RecordSourceSelectorProxy} from 'relay-runtime'
import pluralizeHandler from './pluralizeHandler'
import safeRemoveNodeFromArray from '../../utils/relay/safeRemoveNodeFromArray'
import getCachedRecord from '../../utils/relay/getCachedRecord'

const handleRemoveReflectTemplate = (templateId: string, store: RecordSourceSelectorProxy<any>) => {
  const filterFn = (obj) => {
    if (!obj || obj.__typename !== 'RetrospectiveMeetingSettings') return false
    return (
      obj &&
      obj.__typename === 'RetrospectiveMeetingSettings' &&
      obj.reflectTemplates &&
      obj.reflectTemplates.__refs.includes(templateId)
    )
  }
  const settingsRecord = getCachedRecord(store, filterFn)
  if (!settingsRecord || Array.isArray(settingsRecord)) return
  const settings = store.get(settingsRecord.__id)
  if (!settings) return
  const selectedTemplateId = settings.getValue('selectedTemplateId')
  const templates = settings.getLinkedRecords('reflectTemplates')
  if (!templates) return
  const nextTemplate = templates.find((template) =>
    Boolean(template && template.getValue('id') !== templateId)
  )!
  const nextTemplateId = nextTemplate.getValue('id')
  if (selectedTemplateId === templateId) {
    settings.setValue(nextTemplateId, 'selectedTemplateId')
  }
  const activeTemplateId = settings.getValue('activeTemplateId')
  if (activeTemplateId === templateId) {
    settings.setValue(nextTemplateId, 'activeTemplateId')
  }
  safeRemoveNodeFromArray(templateId, settings, 'reflectTemplates')
}

const handleRemoveReflectTemplates = pluralizeHandler(handleRemoveReflectTemplate)
export default handleRemoveReflectTemplates
