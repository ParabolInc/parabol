import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler'
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray'

const handleRemoveSuggestedAction = (suggestedActionId, store) => {
  const suggestedAction = store.get(suggestedActionId)
  if (!suggestedAction) return
  const userId = suggestedAction.getValue('userId')
  const user = store.get(userId)
  safeRemoveNodeFromArray(suggestedActionId, user, 'suggestedActions')
}

const handleRemoveSuggestedActions = pluralizeHandler(handleRemoveSuggestedAction)
export default handleRemoveSuggestedActions
