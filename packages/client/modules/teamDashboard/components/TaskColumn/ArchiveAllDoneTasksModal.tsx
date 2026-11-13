import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import BatchArchiveTasksMutation from '../../../../mutations/BatchArchiveTasksMutation'
import {Button} from '../../../../ui/Button/Button'
import {Dialog} from '../../../../ui/Dialog/Dialog'
import {DialogActions} from '../../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'

type Props = {
  isOpen: boolean
  taskIds: string[]
  closeModal: () => void
}

const ArchiveAllDoneTasksModal = (props: Props) => {
  const {isOpen, closeModal, taskIds} = props
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const atmosphere = useAtmosphere()

  const onSubmit = async () => {
    if (submitting) return
    submitMutation()
    BatchArchiveTasksMutation(atmosphere, {taskIds}, {onCompleted, onError})
    closeModal()
  }

  return (
    <Dialog isOpen={isOpen} onClose={closeModal}>
      <DialogContent>
        <DialogTitle>{'Archive all'}</DialogTitle>
        <div className='text-base text-fg-primary'>
          This action will archive all <b>Done</b> tasks. Are you sure you want to proceed?
        </div>
        <DialogActions>
          <Button variant='outline' size='md' onClick={closeModal}>
            {'Cancel'}
          </Button>
          <Button variant='primary' size='md' onClick={onSubmit}>
            {'Confirm'}
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default ArchiveAllDoneTasksModal
