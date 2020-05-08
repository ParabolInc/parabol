import styled from '@emotion/styled'
import React, {forwardRef, Ref} from 'react'
import useClickConfirmation from '~/hooks/useClickConfirmation'
import {TransitionStatus} from '~/hooks/useTransition'
import {PALETTE} from '~/styles/paletteV2'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import useRouter from '../hooks/useRouter'
import EndNewMeetingMutation from '../mutations/EndNewMeetingMutation'
import {ElementWidth} from '../types/constEnums'
import isDemoRoute from '../utils/isDemoRoute'
import BottomControlBarProgress from './BottomControlBarProgress'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'
import ConfirmingToggle from './ConfirmingToggle'
import Icon from './Icon'

const FlagIcon = styled(Icon)({
  color: PALETTE.TEXT_BLUE,
  height: 24
})

interface Props {
  meetingId: string
  isEnded: boolean
  status: TransitionStatus
  onTransitionEnd: () => void
}

const EndMeetingButtonStyles = styled(BottomNavControl)({
  width: ElementWidth.END_MEETING_BUTTON
})

const EndMeetingButton = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {isEnded, meetingId, status, onTransitionEnd} = props
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {submitMutation, onCompleted, onError, submitting} = useMutationProps()
  const [isConfirming, startConfirming] = useClickConfirmation()
  const endMeeting = () => {
    if (submitting) return
    if (isConfirming) {
      submitMutation()
      EndNewMeetingMutation(atmosphere, {meetingId}, {history, onError, onCompleted})
    } else {
      startConfirming()
    }
  }

  const label = isConfirming ? 'Confirm' : isDemoRoute() ? 'End Demo' : 'End Meeting'
  return (
    <EndMeetingButtonStyles
      dataCy='end-button'
      onClick={endMeeting}
      waiting={submitting}
      ref={ref}
      disabled={isEnded}
      status={status}
      onTransitionEnd={onTransitionEnd}
    >
      <BottomControlBarProgress isConfirming={isConfirming} progress={0} />
      <BottomNavIconLabel label={label}>
        <ConfirmingToggle isConfirming={isConfirming}>
          <FlagIcon>{'flag'}</FlagIcon>
        </ConfirmingToggle>
      </BottomNavIconLabel>
    </EndMeetingButtonStyles>
  )
})

export default EndMeetingButton
