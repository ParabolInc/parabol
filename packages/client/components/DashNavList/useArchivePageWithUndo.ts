import useAtmosphere from '../../hooks/useAtmosphere'
import {snackOnError} from '../../mutations/handlers/snackOnError'
import {useArchivePageMutation} from '../../mutations/useArchivePageMutation'

export const useArchivePageWithUndo = (pageId: string) => {
  const atmosphere = useAtmosphere()
  const [executeArchive] = useArchivePageMutation()
  return () => {
    executeArchive({
      variables: {pageId, action: 'archive'},
      onError: snackOnError(atmosphere, 'PageActionsArchive'),
      onCompleted(_res, errors) {
        const firstError = errors?.[0]?.message
        if (firstError) {
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: 'PageActionsArchive',
            message: firstError,
            autoDismiss: 5
          })
        } else {
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: 'PageActionsArchiveUndo',
            message: 'Moved to trash',
            action: {
              label: 'Undo',
              callback: () => {
                executeArchive({
                  variables: {pageId, action: 'restore'}
                })
              }
            },
            autoDismiss: 5
          })
        }
      }
    })
  }
}
