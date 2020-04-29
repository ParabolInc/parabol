import styled from '@emotion/styled'
import React, {forwardRef, Ref} from 'react'
import {TransitionStatus} from '~/hooks/useTransition'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import useRouter from '../hooks/useRouter'
import EndNewMeetingMutation from '../mutations/EndNewMeetingMutation'
import {ElementWidth} from '../types/constEnums'
import isDemoRoute from '../utils/isDemoRoute'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'

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

  const endMeeting = () => {
    if (submitting) return
    submitMutation()
    EndNewMeetingMutation(atmosphere, {meetingId}, {history, onError, onCompleted})
  }

  const label = isDemoRoute() ? 'End Demo' : 'End Meeting'
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
      <BottomNavIconLabel icon='flag' iconColor='blue' label={label} />
    </EndMeetingButtonStyles>
  )
})

export default EndMeetingButton
