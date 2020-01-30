import React, {forwardRef, Ref} from 'react'
import EndNewMeetingMutation from '../mutations/EndNewMeetingMutation'
import isDemoRoute from '../utils/isDemoRoute'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'
import useAtmosphere from '../hooks/useAtmosphere'
import useRouter from '../hooks/useRouter'
import useMutationProps from '../hooks/useMutationProps'
import styled from '@emotion/styled'
import {ElementWidth} from '../types/constEnums'

interface Props {
  meetingId: string
  isEnded: boolean
}

const EndMeetingButtonStyles = styled(BottomNavControl)({
  width: ElementWidth.END_MEETING_BUTTON
})

const EndMeetingButton = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {isEnded, meetingId} = props
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
    <EndMeetingButtonStyles onClick={endMeeting} waiting={submitting} ref={ref} disabled={isEnded}>
      <BottomNavIconLabel icon='flag' iconColor='blue' label={label} />
    </EndMeetingButtonStyles>
  )
})

export default EndMeetingButton
