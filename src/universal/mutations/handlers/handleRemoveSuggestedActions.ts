import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler'
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray'

const handleRemoveSuggestedAction = (suggestedActionId, store) => {
  const suggestedAction = store.get(suggestedActionId)
  if (!suggestedAction) return
  const viewer = store.getRoot().getLinkedRecord('viewer')
  safeRemoveNodeFromArray(suggestedActionId, viewer, 'suggestedActions')
}

const handleRemoveSuggestedActions = pluralizeHandler(handleRemoveSuggestedAction)
export default handleRemoveSuggestedActions
