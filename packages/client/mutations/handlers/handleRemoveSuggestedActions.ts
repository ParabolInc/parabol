import {RecordSourceSelectorProxy} from 'relay-runtime'
import safeRemoveNodeFromArray from '../../utils/relay/safeRemoveNodeFromArray'
import pluralizeHandler from './pluralizeHandler'

const handleRemoveSuggestedAction = (
  suggestedActionId: string | null | undefined,
  store: RecordSourceSelectorProxy
) => {
  const suggestedAction = store.get(suggestedActionId!)
  if (!suggestedAction) return
  const viewer = store.getRoot().getLinkedRecord('viewer')!
  safeRemoveNodeFromArray(suggestedActionId, viewer, 'suggestedActions')
}

const handleRemoveSuggestedActions = pluralizeHandler(handleRemoveSuggestedAction)
export default handleRemoveSuggestedActions
