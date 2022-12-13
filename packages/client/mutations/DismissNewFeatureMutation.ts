import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {DismissNewFeatureMutation as TDismissNewFeatureMutation} from '../__generated__/DismissNewFeatureMutation.graphql'

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
      const viewer = store.getRoot().getLinkedRecord('viewer')!
      viewer.setValue(null, 'newFeature')
    },
    optimisticUpdater: (store) => {
      const viewer = store.getRoot().getLinkedRecord('viewer')!
      viewer.setValue(null, 'newFeature')
    },
    onError,
    onCompleted
  })
}

export default DismissNewFeatureMutation
