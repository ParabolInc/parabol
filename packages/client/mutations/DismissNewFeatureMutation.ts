import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {DismissNewFeatureMutation as TDismissNewFeatureMutation} from '../__generated__/DismissNewFeatureMutation.graphql'
import type {StandardMutation} from '../types/relayMutations'

const mutation = graphql`
  mutation DismissNewFeatureMutation {
    dismissNewFeature {
      error {
        title
      }
    }
  }
`

const DismissNewFeatureMutation: StandardMutation<TDismissNewFeatureMutation> = (
  atmosphere,
  variables,
  {onCompleted, onError}
) => {
  return commitMutation<TDismissNewFeatureMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const viewer = store.getRoot().getLinkedRecord('viewer')
      viewer?.setValue(null, 'newFeature')
    },
    optimisticUpdater: (store) => {
      const viewer = store.getRoot().getLinkedRecord('viewer')
      viewer?.setValue(null, 'newFeature')
    },
    onError,
    onCompleted
  })
}

export default DismissNewFeatureMutation
