import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {RetroTeamHealthStart_meeting$key} from '~/__generated__/RetroTeamHealthStart_meeting.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import RetroTeamHealthNoCheck from './RetroTeamHealthNoCheck'
import RetroTeamHealthStartCheckRoot from './RetroTeamHealthStartCheckRoot'

interface Props {
  meeting: RetroTeamHealthStart_meeting$key
}

// a retro without a check: its facilitator can start one, which closes with the retro, or take the
// one the team has open
const RetroTeamHealthStart = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroTeamHealthStart_meeting on RetrospectiveMeeting {
        id
        teamId
        endedAt
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
  const {id: meetingId, teamId, endedAt, facilitatorUserId, facilitator} = meeting
  const {viewerId} = useAtmosphere()
  if (viewerId === facilitatorUserId && !endedAt) {
    return <RetroTeamHealthStartCheckRoot retroMeetingId={meetingId} teamId={teamId} />
  }
  return (
    <RetroTeamHealthNoCheck facilitatorName={facilitator.user.preferredName} isEnded={!!endedAt} />
  )
}

export default RetroTeamHealthStart
