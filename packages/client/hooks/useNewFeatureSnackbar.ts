import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from './useAtmosphere'
import useMutationProps from './useMutationProps'
import DismissNewFeatureMutation from '../mutations/DismissNewFeatureMutation'
import {useNewFeatureSnackbar_viewer$key} from '../__generated__/useNewFeatureSnackbar_viewer.graphql'

const useNewFeatureSnackbar = (viewerRef: useNewFeatureSnackbar_viewer$key) => {
  const atmosphere = useAtmosphere()
  const {onError, onCompleted} = useMutationProps()
  const viewer = useFragment(
    graphql`
      fragment useNewFeatureSnackbar_viewer on User {
        picture
        newFeature {
          actionButtonCopy
          snackbarMessage
          url
        }
      }
    `,
    viewerRef
  )
  const {newFeature} = viewer

  useEffect(() => {
    if (newFeature) {
      const {actionButtonCopy, snackbarMessage, url} = newFeature
      const snack = {
        key: 'newFeature',
        autoDismiss: 0,
        message: snackbarMessage,
        onDismiss: () => DismissNewFeatureMutation(atmosphere, {}, {onCompleted, onError}),
        action: {
          label: actionButtonCopy,
          callback: () => window.open(url, '_blank', 'noopener')?.focus()
        }
      }
      atmosphere.eventEmitter.emit('addSnackbar', snack)
    }
  }, [newFeature])
}

export default useNewFeatureSnackbar
