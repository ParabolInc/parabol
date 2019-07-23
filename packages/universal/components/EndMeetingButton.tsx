import React from 'react'
import EndNewMeetingMutation from 'universal/mutations/EndNewMeetingMutation'
import isDemoRoute from '../utils/isDemoRoute'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import useRouter from 'universal/hooks/useRouter'
import useMutationProps from 'universal/hooks/useMutationProps'

interface Props {
  meetingId: string
}

const EndMeetingButton = (props: Props) => {
  const {meetingId} = props
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
    <BottomNavControl onClick={endMeeting} waiting={submitting}>
      <BottomNavIconLabel icon='flag' iconColor='blue' label={label} />
    </BottomNavControl>
  )
}

export default EndMeetingButton
