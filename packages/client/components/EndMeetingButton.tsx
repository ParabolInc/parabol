import {forwardRef, type Ref} from 'react'
import {useNavigate} from 'react-router'
import EndCheckInMutation from '~/mutations/EndCheckInMutation'
import EndRetrospectiveMutation from '~/mutations/EndRetrospectiveMutation'
import {Flag} from '~/ui/icons'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import EndSprintPokerMutation from '../mutations/EndSprintPokerMutation'
import {Tooltip} from '../ui/Tooltip/Tooltip'
import {TooltipContent} from '../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../ui/Tooltip/TooltipTrigger'
import isDemoRoute from '../utils/isDemoRoute'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'

interface Props {
  cancelConfirm: undefined | (() => void)
  isConfirming: boolean
  setConfirmingButton: (button: string) => void
  meetingId: string
  meetingType: string
  isEnded: boolean
}

const EndMeetingButton = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {cancelConfirm, isConfirming, setConfirmingButton, isEnded, meetingType, meetingId} = props
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const {submitMutation, onCompleted, onError, submitting} = useMutationProps()
  const endMeeting = () => {
    if (submitting) return
    if (isConfirming) {
      setConfirmingButton('')
      submitMutation()
      if (meetingType === 'poker') {
        EndSprintPokerMutation(atmosphere, {meetingId}, {navigate, onError, onCompleted})
      } else if (meetingType === 'action') {
        EndCheckInMutation(atmosphere, {meetingId}, {navigate, onError, onCompleted})
      } else {
        EndRetrospectiveMutation(atmosphere, {meetingId}, {navigate, onError, onCompleted})
      }
    } else {
      setConfirmingButton('end')
    }
  }

  const label = isDemoRoute() ? 'End Demo' : 'End Meeting'
  return (
    <Tooltip open={isConfirming}>
      <BottomNavControl
        confirming={!!cancelConfirm}
        dataCy='end-button'
        onClick={cancelConfirm || endMeeting}
        waiting={submitting}
        ref={ref}
        disabled={isEnded}
      >
        <TooltipTrigger asChild>
          <BottomNavIconLabel label={label}>
            <Flag className='text-sky-500' />
          </BottomNavIconLabel>
        </TooltipTrigger>
      </BottomNavControl>
      <TooltipContent>{`Tap '${label}' again to Confirm`}</TooltipContent>
    </Tooltip>
  )
})

export default EndMeetingButton
