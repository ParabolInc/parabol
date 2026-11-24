import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {RetroSidebarTeamHealthSection_meeting$key} from '~/__generated__/RetroSidebarTeamHealthSection_meeting.graphql'
import type useGotoStageId from '../../hooks/useGotoStageId'
import useGotoTeamHealthStageInRetro from '../../hooks/useGotoTeamHealthStageInRetro'
import TeamHealthSidebarQuestionSection from '../TeamHealth/TeamHealthSidebarQuestionSection'
import TeamHealthSidebarResultSection from '../TeamHealth/TeamHealthSidebarResultSection'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  meeting: RetroSidebarTeamHealthSection_meeting$key
}

// while the viewer is on Team Health, the check's questions are listed beneath it, or its results once
// they are revealed
const RetroSidebarTeamHealthSection = (props: Props) => {
  const {gotoStageId, handleMenuClick, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroSidebarTeamHealthSection_meeting on RetrospectiveMeeting {
        ...useGotoTeamHealthStageInRetro_meeting
        localPhase {
          phaseType
        }
        teamHealthMeeting {
          endedAt
          ...TeamHealthSidebarQuestionSection_meeting
          ...TeamHealthSidebarResultSection_meeting
        }
      }
    `,
    meetingRef
  )
  const {localPhase, teamHealthMeeting} = meeting
  const gotoCheckStage = useGotoTeamHealthStageInRetro(meeting, gotoStageId)
  if (localPhase?.phaseType !== 'TEAM_HEALTH' || !teamHealthMeeting) return null
  const Section = teamHealthMeeting.endedAt
    ? TeamHealthSidebarResultSection
    : TeamHealthSidebarQuestionSection
  return (
    <Section
      gotoStageId={gotoCheckStage}
      handleMenuClick={handleMenuClick}
      meeting={teamHealthMeeting}
    />
  )
}

export default RetroSidebarTeamHealthSection
