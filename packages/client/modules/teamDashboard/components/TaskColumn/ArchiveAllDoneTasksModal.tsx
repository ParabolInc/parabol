import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import BatchArchiveTasksMutation from '../../../../mutations/BatchArchiveTasksMutation'
import {Button} from '../../../../ui/Button/Button'
import {Dialog} from '../../../../ui/Dialog/Dialog'
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
        <div className='pb-4 text-base text-fg-primary'>
          This action will archive all <b>Done</b> tasks. Are you sure you want to proceed?
        </div>
        <div className='flex w-full justify-end gap-2'>
          <Button
            variant='flat'
            size='sm'
            onClick={closeModal}
            className='bg-slate-500 font-semibold text-white duration-300 ease-in-out hover:bg-slate-700 focus:bg-slate-700'
          >
            {'Cancel'}
          </Button>
          <Button
            variant='flat'
            size='sm'
            onClick={onSubmit}
            className='bg-sky-500 font-semibold text-white duration-300 ease-in-out hover:bg-sky-700 focus:bg-sky-700'
          >
            {'Confirm'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ArchiveAllDoneTasksModal
