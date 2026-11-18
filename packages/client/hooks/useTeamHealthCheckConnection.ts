import {useNavigate} from '@tanstack/react-router'
import {useEffect} from 'react'
import useJoinTeamHealthCheckMutation from '../mutations/useJoinTeamHealthCheckMutation'
import MeetingSubscription from '../subscriptions/MeetingSubscription'
import useAtmosphere from './useAtmosphere'

const useTeamHealthCheckConnection = (
  teamHealthMeetingId: string | undefined,
  shouldJoin: boolean
) => {
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const [joinTeamHealthCheck] = useJoinTeamHealthCheckMutation()
  useEffect(() => {
    if (!teamHealthMeetingId) return
    return atmosphere.retainSubscription(
      MeetingSubscription,
      {meetingId: teamHealthMeetingId},
      {navigate},
      5000
    )
  }, [teamHealthMeetingId])
  useEffect(() => {
    if (!teamHealthMeetingId || !shouldJoin) return
    joinTeamHealthCheck({variables: {meetingId: teamHealthMeetingId}})
  }, [teamHealthMeetingId, shouldJoin])
}

export default useTeamHealthCheckConnection
