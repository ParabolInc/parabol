import type {RecordSourceSelectorProxy} from 'relay-runtime'
import safeRemoveNodeFromArray from '~/utils/relay/safeRemoveNodeFromArray'
import pluralizeHandler from './pluralizeHandler'

const handleRemovePokerTemplateDimension = (
  dimensionId: string,
  templateId: string,
  store: RecordSourceSelectorProxy
) => {
  const template = store.get(templateId)
  if (!template) return
  safeRemoveNodeFromArray(dimensionId, template, 'dimensions')
}

const handleRemovePokerTemplateDimensions = pluralizeHandler(handleRemovePokerTemplateDimension)
export default handleRemovePokerTemplateDimensions
