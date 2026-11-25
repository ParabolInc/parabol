import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {RetroSidebarTeamHealthSection_meeting$key} from '~/__generated__/RetroSidebarTeamHealthSection_meeting.graphql'
import type useGotoStageId from '../../hooks/useGotoStageId'
import useGotoTeamHealthStageInRetro from '../../hooks/useGotoTeamHealthStageInRetro'
import getTeamHealthCheckShownInRetro from '../../utils/meetings/getTeamHealthCheckShownInRetro'
import TeamHealthSidebarQuestionSection from '../TeamHealth/TeamHealthSidebarQuestionSection'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  meeting: RetroSidebarTeamHealthSection_meeting$key
}

// while the viewer is on Team Health, the check's questions are listed beneath it, as beneath the
// check's own Respond row. Its results go beneath the Results row (RetroSidebarTeamHealthResults)
const RetroSidebarTeamHealthSection = (props: Props) => {
  const {gotoStageId, handleMenuClick, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroSidebarTeamHealthSection_meeting on RetrospectiveMeeting {
        ...useGotoTeamHealthStageInRetro_meeting
        endedAt
        localPhase {
          phaseType
        }
        teamHealthMeeting {
          endedAt
          ...TeamHealthSidebarQuestionSection_meeting
        }
      }
    `,
    meetingRef
  )
  const {localPhase} = meeting
  const teamHealthMeeting = getTeamHealthCheckShownInRetro(meeting)
  const gotoCheckStage = useGotoTeamHealthStageInRetro(meeting, gotoStageId)
  if (localPhase?.phaseType !== 'TEAM_HEALTH' || !teamHealthMeeting) return null
  return (
    <TeamHealthSidebarQuestionSection
      gotoStageId={gotoCheckStage}
      handleMenuClick={handleMenuClick}
      meeting={teamHealthMeeting}
    />
  )
}

export default RetroSidebarTeamHealthSection
