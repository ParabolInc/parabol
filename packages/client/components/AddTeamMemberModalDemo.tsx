import modalTeamInvitePng from '../../../static/images/illustrations/illus-modal-team-invite.png'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogContent} from '../ui/Dialog/DialogContent'
import hasToken from '../utils/hasToken'
import DemoCreateAccountPrimaryButton from './DemoCreateAccountPrimaryButton'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const AddTeamMemberModalDemo = (props: Props) => {
  const {isOpen, onClose} = props
  const copy = hasToken()
    ? 'Invite your teammates to a team and kick off a real Retro!'
    : 'Sign up, invite your teammates, and kick off a real Retro!'
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        <div className='flex flex-col items-center'>
          <img alt='' src={modalTeamInvitePng} className='mx-auto mt-4 block w-full max-w-xs' />
          <p className='my-4 p-0 text-center text-base leading-relaxed'>{copy}</p>
          <DemoCreateAccountPrimaryButton />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddTeamMemberModalDemo
