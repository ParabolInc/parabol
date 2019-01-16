import {
  DismissSuggestedActionMutation,
  DismissSuggestedActionMutationVariables
} from '__generated__/DismissSuggestedActionMutation.graphql'
import {commitMutation, graphql} from 'react-relay'
import {LocalHandlers} from '../types/relayMutations'
import handleRemoveSuggestedActions from './handlers/handleRemoveSuggestedActions'

const mutation = graphql`
  mutation DismissSuggestedActionMutation($suggestedActionId: ID!) {
    dismissSuggestedAction(suggestedActionId: $suggestedActionId) {
      error {
        title
      }
    }
  }
`

const DismissSuggestedActionMutation = (
  atmosphere,
  variables: DismissSuggestedActionMutationVariables,
  {onCompleted, onError}: LocalHandlers
) => {
  const {suggestedActionId} = variables
  return commitMutation<DismissSuggestedActionMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      handleRemoveSuggestedActions(suggestedActionId, store)
    },
    optimisticUpdater: (store) => {
      handleRemoveSuggestedActions(suggestedActionId, store)
    },
    onError,
    onCompleted
  })
}

export default DismissSuggestedActionMutation
