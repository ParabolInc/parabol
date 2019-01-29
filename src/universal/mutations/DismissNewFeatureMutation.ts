import {
  DismissNewFeatureMutation,
  DismissNewFeatureMutationVariables
} from '__generated__/DismissNewFeatureMutation.graphql'
import {commitMutation, graphql} from 'react-relay'
import {LocalHandlers} from '../types/relayMutations'

const mutation = graphql`
  mutation DismissNewFeatureMutation {
    dismissNewFeature {
      error {
        title
      }
    }
  }
`

const DismissNewFeatureMutation = (
  atmosphere,
  variables: DismissNewFeatureMutationVariables,
  {onCompleted, onError}: LocalHandlers
) => {
  return commitMutation<DismissNewFeatureMutation>(atmosphere, {
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
