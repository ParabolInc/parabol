import modalTeamInvitePng from '../../../static/images/illustrations/illus-modal-team-invite.png'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
import hasToken from '../utils/hasToken'
import isTeamHealthDemoRoute from '../utils/isTeamHealthDemoRoute'
import DemoCreateAccountPrimaryButton from './DemoCreateAccountPrimaryButton'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const AddTeamMemberModalDemo = (props: Props) => {
  const {isOpen, onClose} = props
  const activity = isTeamHealthDemoRoute() ? 'Team Health check' : 'Retro'
  const copy = hasToken()
    ? `Invite your teammates to a team and kick off a real ${activity}!`
    : `Sign up, invite your teammates, and kick off a real ${activity}!`
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogTitle className='sr-only'>Invite your teammates</DialogTitle>
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
