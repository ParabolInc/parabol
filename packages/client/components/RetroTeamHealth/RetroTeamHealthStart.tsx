import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {RetroTeamHealthStart_meeting$key} from '~/__generated__/RetroTeamHealthStart_meeting.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import RetroTeamHealthNoCheck from './RetroTeamHealthNoCheck'
import RetroTeamHealthStartCheckRoot from './RetroTeamHealthStartCheckRoot'

interface Props {
  meeting: RetroTeamHealthStart_meeting$key
}

// a retro whose team has no check open: its facilitator can start one, which closes with the retro
const RetroTeamHealthStart = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroTeamHealthStart_meeting on RetrospectiveMeeting {
        id
        teamId
        facilitatorUserId
        facilitator {
          user {
            preferredName
          }
        }
      }
    `,
    meetingRef
  )
  const {id: meetingId, teamId, facilitatorUserId, facilitator} = meeting
  const {viewerId} = useAtmosphere()
  return viewerId === facilitatorUserId ? (
    <RetroTeamHealthStartCheckRoot retroMeetingId={meetingId} teamId={teamId} />
  ) : (
    <RetroTeamHealthNoCheck facilitatorName={facilitator.user.preferredName} />
  )
}

export default RetroTeamHealthStart
