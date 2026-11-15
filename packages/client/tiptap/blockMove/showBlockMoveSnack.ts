import type {Editor} from '@tiptap/core'
import type Atmosphere from '../../Atmosphere'
import type {SnackAction} from '../../components/Snackbar'
import {GQLID} from '../../utils/GQLID'
import {getPageSlug} from '../getPageSlug'
import {getBlockMoveMessage} from './getBlockMoveMessage'
import type {BlockMoveOutcome} from './moveBlocksToPage'
import {setPendingArrival} from './pendingArrivals'
import {BLOCK_MOVE_SNACK_KEY} from './showBlockMoveNotice'
import {undoBlockMove} from './undoBlockMove'

type Params = {
  atmosphere: Atmosphere
  editor: Editor
  navigate: (path: string) => void
  outcome: BlockMoveOutcome
  count: number
  targetPageId: string
  targetTitle: string
}

let releaseShown: (() => void) | null = null

export const showBlockMoveSnack = ({
  atmosphere,
  editor,
  navigate,
  outcome,
  count,
  targetPageId,
  targetTitle
}: Params) => {
  const {result, meta, gap, moved} = outcome
  const message = getBlockMoveMessage(result, count, targetTitle)
  if (!message) return
  releaseShown?.()
  atmosphere.eventEmitter.emit('removeSnackbar', ({key}) => key === BLOCK_MOVE_SNACK_KEY)
  const release = () => {
    gap?.stop()
    editor.off('destroy', onEditorDestroy)
    if (releaseShown === release) releaseShown = null
  }
  const onEditorDestroy = () => {
    atmosphere.eventEmitter.emit('removeSnackbar', ({onDismiss}) => onDismiss === release)
    release()
  }
  releaseShown = release
  editor.on('destroy', onEditorDestroy)
  const [pageCode] = GQLID.fromKey(targetPageId)
  const openPage: SnackAction | undefined = moved
    ? {
        label: 'Open page',
        callback: () => {
          setPendingArrival(targetPageId, moved)
          navigate(`/pages/${getPageSlug(pageCode, targetTitle)}`)
        }
      }
    : undefined
  const undo: SnackAction | undefined =
    result === 'moved' && meta && gap
      ? {
          label: 'Undo',
          callback: () => {
            undoBlockMove(editor, meta, gap)
          }
        }
      : undefined
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: BLOCK_MOVE_SNACK_KEY,
    message,
    autoDismiss: 10,
    onDismiss: release,
    ...(openPage && {action: openPage}),
    ...(undo && {secondaryAction: undo})
  })
}
