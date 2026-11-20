import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {RetroTeamHealthCheckPhase_meeting$key} from '~/__generated__/RetroTeamHealthCheckPhase_meeting.graphql'
import {phaseLabelLookup} from '../../utils/meetings/lookups'
import MeetingContent from '../MeetingContent'
import MeetingHeaderAndPhase from '../MeetingHeaderAndPhase'
import MeetingTopBar from '../MeetingTopBar'
import PhaseHeaderDescription from '../PhaseHeaderDescription'
import PhaseHeaderTitle from '../PhaseHeaderTitle'
import PhaseWrapper from '../PhaseWrapper'
import type {RetroMeetingPhaseProps} from '../RetroMeeting'
import StageTimerDisplay from '../StageTimerDisplay'
import RetroTeamHealthCheckContent from './RetroTeamHealthCheckContent'

interface Props extends RetroMeetingPhaseProps {
  meeting: RetroTeamHealthCheckPhase_meeting$key
}

const RetroTeamHealthCheckPhase = (props: Props) => {
  const {
    avatarGroup,
    toggleSidebar,
    gotoStageId,
    meeting: meetingRef,
    rightDrawerOpen,
    toggleDrawer
  } = props
  const meeting = useFragment(
    graphql`
      fragment RetroTeamHealthCheckPhase_meeting on RetrospectiveMeeting {
        ...StageTimerDisplay_meeting
        ...RetroTeamHealthCheckContent_meeting
        endedAt
        showSidebar
      }
    `,
    meetingRef
  )
  const {endedAt, showSidebar} = meeting
  return (
    <MeetingContent>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
          rightDrawerOpen={rightDrawerOpen}
          drawerType='settings'
          toggleDrawer={toggleDrawer}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.TEAM_HEALTH_CHECK}</PhaseHeaderTitle>
          <PhaseHeaderDescription>
            {"Answer your team's open check. Private, about 2 minutes"}
          </PhaseHeaderDescription>
        </MeetingTopBar>
        <PhaseWrapper>
          <div className='flex min-h-0 w-full flex-1 flex-col overflow-y-auto'>
            <div className='m-auto flex w-full flex-col items-center'>
              <StageTimerDisplay meeting={meeting} />
              <RetroTeamHealthCheckContent meeting={meeting} gotoStageId={gotoStageId} />
            </div>
          </div>
        </PhaseWrapper>
      </MeetingHeaderAndPhase>
    </MeetingContent>
  )
}

export default RetroTeamHealthCheckPhase
