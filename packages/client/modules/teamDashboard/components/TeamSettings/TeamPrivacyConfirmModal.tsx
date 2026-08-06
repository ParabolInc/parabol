import {TierLabel} from '../../../../types/constEnums'
import {Button} from '../../../../ui/Button/Button'
import {Dialog} from '../../../../ui/Dialog/Dialog'
import {DialogActions} from '../../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'

interface Props {
  isOpen: boolean
  teamName: string
  onClose: () => void
  onConfirm: () => void
}

const TeamPrivacyConfirmModal = (props: Props) => {
  const {isOpen, teamName, onClose, onConfirm} = props

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className='w-[400px] p-4'>
        <DialogTitle>Make team public?</DialogTitle>
        <div className='my-4 text-fg-primary'>
          <p>
            You're about to make <b>{teamName}</b> public. This means:
          </p>
          <ul className='mt-2 list-disc pl-5'>
            <li>Anyone in your organization can find and join this team</li>
            <li>
              This action <b>cannot be undone</b> on the Starter Plan
            </li>
            <li>
              You would need to upgrade to the {TierLabel.TEAM} or {TierLabel.ENTERPRISE} Plan to
              make it private again
            </li>
          </ul>
          <p className='mt-2'>Are you sure you want to continue?</p>
        </div>
        <DialogActions>
          <Button variant='outline' size='sm' onClick={onClose}>
            Cancel
          </Button>
          <Button variant='primary' size='sm' className='ml-4 text-sm' onClick={onConfirm}>
            Make Team Public
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default TeamPrivacyConfirmModal
