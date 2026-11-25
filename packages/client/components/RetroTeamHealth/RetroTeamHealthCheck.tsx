import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {RetroTeamHealthCheck_meeting$key} from '~/__generated__/RetroTeamHealthCheck_meeting.graphql'
import type {RetroTeamHealthCheck_teamHealthMeeting$key} from '~/__generated__/RetroTeamHealthCheck_teamHealthMeeting.graphql'
import type useGotoStageId from '../../hooks/useGotoStageId'
import useGotoTeamHealthStageInRetro from '../../hooks/useGotoTeamHealthStageInRetro'
import TeamHealthPhaseContent from '../TeamHealth/TeamHealthPhaseContent'

interface Props {
  meeting: RetroTeamHealthCheck_meeting$key
  teamHealthMeeting: RetroTeamHealthCheck_teamHealthMeeting$key
  gotoStageId: ReturnType<typeof useGotoStageId>
}

// the check's own phases, inside the retro. The retro keeps the check's local stage
// (useTeamHealthCheckInRetro), so it is right even when the viewer arrives after a reveal
const RetroTeamHealthCheck = (props: Props) => {
  const {meeting: meetingRef, teamHealthMeeting: teamHealthMeetingRef, gotoStageId} = props
  const meeting = useFragment(
    graphql`
      fragment RetroTeamHealthCheck_meeting on RetrospectiveMeeting {
        ...useGotoTeamHealthStageInRetro_meeting
        ...TeamHealthIntroPhase_retroMeeting
      }
    `,
    meetingRef
  )
  const teamHealthMeeting = useFragment(
    graphql`
      fragment RetroTeamHealthCheck_teamHealthMeeting on TeamHealthMeeting {
        ...TeamHealthPhaseContent_meeting
        endedAt
        viewerMeetingMember {
          id
        }
      }
    `,
    teamHealthMeetingRef
  )
  const gotoCheckStage = useGotoTeamHealthStageInRetro(meeting, gotoStageId)
  // answers need membership, so an open check waits for the join to land
  if (!teamHealthMeeting.endedAt && !teamHealthMeeting.viewerMeetingMember) return null
  return (
    <TeamHealthPhaseContent
      meeting={teamHealthMeeting}
      gotoStageId={gotoCheckStage}
      retroMeeting={meeting}
    />
  )
}

export default RetroTeamHealthCheck
