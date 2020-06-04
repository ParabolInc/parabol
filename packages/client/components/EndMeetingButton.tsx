import styled from '@emotion/styled'
import React, {forwardRef, Ref} from 'react'
import {TransitionStatus} from '~/hooks/useTransition'
import {PALETTE} from '~/styles/paletteV2'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuPosition} from '../hooks/useCoords'
import useMutationProps from '../hooks/useMutationProps'
import useRouter from '../hooks/useRouter'
import useTooltip from '../hooks/useTooltip'
import EndNewMeetingMutation from '../mutations/EndNewMeetingMutation'
import {ElementWidth, Times} from '../types/constEnums'
import isDemoRoute from '../utils/isDemoRoute'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'
import Icon from './Icon'

const FlagIcon = styled(Icon)({
  color: PALETTE.BACKGROUND_BLUE,
  height: 24
})

interface Props {
  cancelConfirm: undefined | (() => void)
  isConfirming: boolean
  setConfirmingButton: (button: string) => void
  meetingId: string
  isEnded: boolean
  status: TransitionStatus
  onTransitionEnd: () => void
}

const EndMeetingButtonStyles = styled(BottomNavControl)({
  width: ElementWidth.END_MEETING_BUTTON
})

const EndMeetingButton = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {
    cancelConfirm,
    isConfirming,
    setConfirmingButton,
    isEnded,
    meetingId,
    status,
    onTransitionEnd
  } = props
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {submitMutation, onCompleted, onError, submitting} = useMutationProps()
  const {openTooltip, tooltipPortal, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER,
    {
      disabled: !isConfirming,
      delay: Times.MEETING_CONFIRM_TOOLTIP_DELAY
    }
  )
  const endMeeting = () => {
    if (submitting) return
    if (isConfirming) {
      setConfirmingButton('')
      submitMutation()
      EndNewMeetingMutation(atmosphere, {meetingId}, {history, onError, onCompleted})
    } else {
      setConfirmingButton('end')
      setTimeout(openTooltip)
    }
  }

  const label = isDemoRoute() ? 'End Demo' : 'End Meeting'
  return (
    <>
      <EndMeetingButtonStyles
        confirming={!!cancelConfirm}
        dataCy='end-button'
        onClick={cancelConfirm || endMeeting}
        waiting={submitting}
        ref={ref}
        disabled={isEnded}
        status={status}
        onTransitionEnd={onTransitionEnd}
      >
        <BottomNavIconLabel label={label} ref={originRef}>
          <FlagIcon>{'flag'}</FlagIcon>
        </BottomNavIconLabel>
      </EndMeetingButtonStyles>
      {tooltipPortal(`Tap '${label}' again to Confirm`)}
    </>
  )
})

export default EndMeetingButton
