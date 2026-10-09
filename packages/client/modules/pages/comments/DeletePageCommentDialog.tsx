import {useDeletePageCommentMutation} from '../../../mutations/useDeletePageCommentMutation'
import {Button} from '../../../ui/Button/Button'
import {Dialog} from '../../../ui/Dialog/Dialog'
import {DialogActions} from '../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../ui/Dialog/DialogTitle'

interface Props {
  commentId: string
  isThreadStarter: boolean
  closeDialog: () => void
}

export const DeletePageCommentDialog = (props: Props) => {
  const {commentId, isThreadStarter, closeDialog} = props
  const [deleteComment, submitting] = useDeletePageCommentMutation()
  const confirmDelete = () => {
    deleteComment({variables: {commentId}, onCompleted: closeDialog})
  }
  return (
    <Dialog isOpen onClose={closeDialog}>
      <DialogContent className='z-10 md:max-w-80'>
        <DialogTitle className='mb-4'>
          {isThreadStarter ? 'Delete this thread?' : 'Delete this comment?'}
        </DialogTitle>
        <div className='text-fg-primary text-sm leading-5'>
          {isThreadStarter
            ? 'The comment and all of its replies will be deleted for everyone.'
            : 'The comment will be deleted for everyone.'}
        </div>
        <DialogActions>
          <Button variant='flat' onClick={closeDialog} className='p-2'>
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={confirmDelete}
            disabled={submitting}
            className='p-2'
          >
            Delete permanently
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
