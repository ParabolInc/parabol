import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {RetroSidebarTeamHealthResults_meeting$key} from '~/__generated__/RetroSidebarTeamHealthResults_meeting.graphql'
import type useGotoStageId from '../../hooks/useGotoStageId'
import useGotoTeamHealthStageInRetro from '../../hooks/useGotoTeamHealthStageInRetro'
import getTeamHealthCheckShownInRetro from '../../utils/meetings/getTeamHealthCheckShownInRetro'
import {phaseLabelLookup} from '../../utils/meetings/lookups'
import NewMeetingSidebarPhaseListItem from '../NewMeetingSidebarPhaseListItem'
import TeamHealthSidebarResultSection from '../TeamHealth/TeamHealthSidebarResultSection'

interface Props {
  handleClick: (() => void) | undefined
  isConfirming: boolean
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  meeting: RetroSidebarTeamHealthResults_meeting$key
}

// the check's own Results row: the waiting room until the reveal, then the results, listed beneath it
// while the viewer is on Team Health
const RetroSidebarTeamHealthResults = (props: Props) => {
  const {handleClick, isConfirming, gotoStageId, handleMenuClick, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroSidebarTeamHealthResults_meeting on RetrospectiveMeeting {
        ...useGotoTeamHealthStageInRetro_meeting
        endedAt
        localPhase {
          phaseType
        }
        teamHealthMeeting {
          ...TeamHealthSidebarResultSection_meeting
          endedAt
          localPhase {
            phaseType
          }
          phases {
            phaseType
            stages {
              id
            }
          }
        }
      }
    `,
    meetingRef
  )
  const gotoCheckStage = useGotoTeamHealthStageInRetro(meeting, gotoStageId)
  const {localPhase} = meeting
  const teamHealthMeeting = getTeamHealthCheckShownInRetro(meeting)
  if (!teamHealthMeeting) return null
  const {endedAt, phases} = teamHealthMeeting
  const isOnTeamHealth = localPhase?.phaseType === 'TEAM_HEALTH'
  const isOnWaitingRoom =
    isOnTeamHealth && !endedAt && teamHealthMeeting.localPhase?.phaseType === 'TEAM_HEALTH_RESULT'
  const resultCount = phases.find(({phaseType}) => phaseType === 'TEAM_HEALTH_RESULT')?.stages
    .length
  return (
    <>
      <NewMeetingSidebarPhaseListItem
        handleClick={handleClick}
        isActive={isOnWaitingRoom}
        isCollapsible={!!endedAt}
        isConfirming={isConfirming}
        isFacilitatorPhase={false}
        isUnsyncedFacilitatorPhase={false}
        phaseCount={endedAt ? resultCount : undefined}
        phaseLabel={endedAt ? undefined : phaseLabelLookup.TEAM_HEALTH_SUBMITTED}
        phaseType='TEAM_HEALTH_RESULT'
      />
      {isOnTeamHealth && endedAt && (
        <TeamHealthSidebarResultSection
          gotoStageId={gotoCheckStage}
          handleMenuClick={handleMenuClick}
          meeting={teamHealthMeeting}
        />
      )}
    </>
  )
}

export default RetroSidebarTeamHealthResults
