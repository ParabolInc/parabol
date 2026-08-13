import {Button} from '~/ui/Button/Button'
import {Dialog} from '~/ui/Dialog/Dialog'
import {DialogContent} from '~/ui/Dialog/DialogContent'
import {DialogTitle} from '~/ui/Dialog/DialogTitle'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  serviceName: string
  teamName: string
}

const TaskFooterTeamAssigneeAddIntegrationDialog = (props: Props) => {
  const {isOpen, onClose, onConfirm, serviceName, teamName} = props

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogTitle>
          {serviceName} integration for {teamName}
        </DialogTitle>
        <p className='m-0 pb-4 text-sm leading-5'>
          You don't have {serviceName} configured for {teamName}. Do you want to add it now?
        </p>
        <div className='mt-6 flex justify-end gap-4'>
          <Button variant='outline' onClick={onClose} size='md'>
            Cancel
          </Button>
          <Button variant='primary' onClick={onConfirm} size='md'>
            Add it now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TaskFooterTeamAssigneeAddIntegrationDialog
