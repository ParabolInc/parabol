import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamHealthMeetingSidebar_meeting$key} from '~/__generated__/TeamHealthMeetingSidebar_meeting.graphql'
import type useGotoStageId from '../hooks/useGotoStageId'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import MeetingNavList from './MeetingNavList'
import NewMeetingSidebar from './NewMeetingSidebar'
import NewMeetingSidebarPhaseListItem from './NewMeetingSidebarPhaseListItem'
import TeamHealthSidebarQuestionSection from './TeamHealth/TeamHealthSidebarQuestionSection'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  toggleSidebar: () => void
  meeting: TeamHealthMeetingSidebar_meeting$key
}

const TeamHealthMeetingSidebar = (props: Props) => {
  const {gotoStageId, handleMenuClick, toggleSidebar, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment TeamHealthMeetingSidebar_meeting on TeamHealthMeeting {
        ...NewMeetingSidebar_meeting
        ...TeamHealthSidebarQuestionSection_meeting
        endedAt
        localPhase {
          phaseType
        }
        phases {
          phaseType
          stages {
            id
            isNavigable
          }
        }
      }
    `,
    meetingRef
  )
  const {endedAt, localPhase, phases} = meeting
  // the intro & submitted phases are bookends, not destinations, so they stay out of the nav
  const questionStages = phases.find((phase) => phase.phaseType === 'TEAM_HEALTH_RESPONSE')?.stages
  const resultStage = phases.find((phase) => phase.phaseType === 'TEAM_HEALTH_RESULT')?.stages[0]
  const firstQuestionStage = questionStages?.[0]
  const goto = (stageId: string) => {
    gotoStageId(stageId).catch(() => {
      /*ignore*/
    })
    handleMenuClick()
  }
  return (
    <NewMeetingSidebar
      handleMenuClick={handleMenuClick}
      toggleSidebar={toggleSidebar}
      meeting={meeting}
    >
      <MeetingNavList>
        <NewMeetingSidebarPhaseListItem
          handleClick={
            firstQuestionStage?.isNavigable ? () => goto(firstQuestionStage.id) : undefined
          }
          // the question stages below carry the active state for this phase
          isActive={false}
          isCollapsible
          isFacilitatorPhase={false}
          isUnsyncedFacilitatorPhase={false}
          phaseCount={questionStages?.length}
          phaseType='TEAM_HEALTH_RESPONSE'
        />
        <TeamHealthSidebarQuestionSection
          gotoStageId={gotoStageId}
          handleMenuClick={handleMenuClick}
          meeting={meeting}
        />
        <NewMeetingSidebarPhaseListItem
          handleClick={resultStage?.isNavigable ? () => goto(resultStage.id) : undefined}
          isActive={localPhase?.phaseType === 'TEAM_HEALTH_RESULT'}
          isFacilitatorPhase={false}
          isUnsyncedFacilitatorPhase={false}
          // until the owner reveals, this row opens the waiting room rather than the results
          phaseLabel={endedAt ? undefined : phaseLabelLookup.TEAM_HEALTH_SUBMITTED}
          phaseType='TEAM_HEALTH_RESULT'
        />
      </MeetingNavList>
    </NewMeetingSidebar>
  )
}

export default TeamHealthMeetingSidebar
