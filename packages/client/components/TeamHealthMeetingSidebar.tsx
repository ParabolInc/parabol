import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {TeamHealthMeetingSidebar_meeting$key} from '~/__generated__/TeamHealthMeetingSidebar_meeting.graphql'
import type useGotoStageId from '../hooks/useGotoStageId'
import {GQLID} from '../utils/GQLID'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import MeetingNavList from './MeetingNavList'
import NewMeetingSidebar from './NewMeetingSidebar'
import NewMeetingSidebarPhaseListItem from './NewMeetingSidebarPhaseListItem'
import TeamHealthSidebarQuestionSection from './TeamHealth/TeamHealthSidebarQuestionSection'
import TeamHealthSidebarResultSection from './TeamHealth/TeamHealthSidebarResultSection'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  toggleSidebar: () => void
  meeting: TeamHealthMeetingSidebar_meeting$key
}

const TeamHealthMeetingSidebar = (props: Props) => {
  const {gotoStageId, handleMenuClick, toggleSidebar, meeting: meetingRef} = props
  const navigate = useNavigate()
  const meeting = useFragment(
    graphql`
      fragment TeamHealthMeetingSidebar_meeting on TeamHealthMeeting {
        ...NewMeetingSidebar_meeting
        ...TeamHealthSidebarQuestionSection_meeting
        ...TeamHealthSidebarResultSection_meeting
        endedAt
        summaryPageId
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
  const {endedAt, localPhase, phases, summaryPageId} = meeting
  // the intro phase is a bookend, not a destination, so it stays out of the nav
  const questionStages = phases.find((phase) => phase.phaseType === 'TEAM_HEALTH_RESPONSE')?.stages
  const resultStages = phases.find((phase) => phase.phaseType === 'TEAM_HEALTH_RESULT')?.stages
  const firstQuestionStage = questionStages?.[0]
  const firstResultStage = resultStages?.[0]
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
          handleClick={firstResultStage?.isNavigable ? () => goto(firstResultStage.id) : undefined}
          // once revealed, the category stages below carry the active state for this phase
          isActive={!endedAt && localPhase?.phaseType === 'TEAM_HEALTH_RESULT'}
          isCollapsible={!!endedAt}
          isFacilitatorPhase={false}
          isUnsyncedFacilitatorPhase={false}
          phaseCount={endedAt ? resultStages?.length : undefined}
          // until the owner reveals, this row opens the waiting room rather than the results
          phaseLabel={endedAt ? undefined : phaseLabelLookup.TEAM_HEALTH_SUBMITTED}
          phaseType='TEAM_HEALTH_RESULT'
        />
        {endedAt && (
          <TeamHealthSidebarResultSection
            gotoStageId={gotoStageId}
            handleMenuClick={handleMenuClick}
            meeting={meeting}
          />
        )}
        {summaryPageId && (
          <NewMeetingSidebarPhaseListItem
            handleClick={() => {
              navigate(`/pages/${GQLID.fromKey(summaryPageId)[0]}`)
              handleMenuClick()
            }}
            isActive={false}
            isFacilitatorPhase={false}
            isUnsyncedFacilitatorPhase={false}
            phaseType='SUMMARY'
          />
        )}
      </MeetingNavList>
    </NewMeetingSidebar>
  )
}

export default TeamHealthMeetingSidebar
