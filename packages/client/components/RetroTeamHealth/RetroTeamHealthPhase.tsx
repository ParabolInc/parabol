import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {RetroTeamHealthPhase_meeting$key} from '~/__generated__/RetroTeamHealthPhase_meeting.graphql'
import getTeamHealthCheckShownInRetro from '../../utils/meetings/getTeamHealthCheckShownInRetro'
import {phaseLabelLookup} from '../../utils/meetings/lookups'
import MeetingContent from '../MeetingContent'
import MeetingHeaderAndPhase from '../MeetingHeaderAndPhase'
import MeetingTopBar from '../MeetingTopBar'
import PhaseHeaderDescription from '../PhaseHeaderDescription'
import PhaseHeaderTitle from '../PhaseHeaderTitle'
import PhaseWrapper from '../PhaseWrapper'
import type {RetroMeetingPhaseProps} from '../RetroMeeting'
import StageTimerDisplay from '../StageTimerDisplay'
import getTeamHealthDiscussionId from '../TeamHealth/getTeamHealthDiscussionId'
import TeamHealthIntroPhase from '../TeamHealth/TeamHealthIntroPhase'
import RetroTeamHealthCheck from './RetroTeamHealthCheck'
import RetroTeamHealthCheckStillOpen from './RetroTeamHealthCheckStillOpen'

interface Props extends RetroMeetingPhaseProps {
  meeting: RetroTeamHealthPhase_meeting$key
}

const RetroTeamHealthPhase = (props: Props) => {
  const {avatarGroup, toggleSidebar, gotoStageId, meeting: meetingRef} = props
  const {rightDrawerOpen, toggleDrawer} = props
  const meeting = useFragment(
    graphql`
      fragment RetroTeamHealthPhase_meeting on RetrospectiveMeeting {
        ...StageTimerDisplay_meeting
        ...TeamHealthIntroPhase_retroMeeting
        ...RetroTeamHealthCheck_meeting
        endedAt
        showSidebar
        teamHealthMeeting {
          id
          endedAt
          ...RetroTeamHealthCheck_teamHealthMeeting
          ...getTeamHealthDiscussionId_meeting
        }
      }
    `,
    meetingRef
  )
  const {endedAt, showSidebar, teamHealthMeeting} = meeting
  const shownCheck = getTeamHealthCheckShownInRetro(meeting)
  const discussionId = shownCheck && getTeamHealthDiscussionId(shownCheck)
  return (
    <MeetingContent>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
          rightDrawerOpen={rightDrawerOpen}
          drawerType={discussionId ? 'discussion' : 'settings'}
          toggleDrawer={toggleDrawer}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.TEAM_HEALTH}</PhaseHeaderTitle>
          <PhaseHeaderDescription>
            {'Answer your team’s check and talk through its results'}
          </PhaseHeaderDescription>
        </MeetingTopBar>
        <PhaseWrapper>
          <div className='flex min-h-0 w-full flex-1 flex-col overflow-y-auto'>
            <div className='m-auto flex w-full flex-col items-center'>
              <StageTimerDisplay meeting={meeting} />
              {shownCheck ? (
                <RetroTeamHealthCheck
                  key={shownCheck.id}
                  meeting={meeting}
                  teamHealthMeeting={shownCheck}
                  gotoStageId={gotoStageId}
                />
              ) : teamHealthMeeting ? (
                <RetroTeamHealthCheckStillOpen teamHealthMeetingId={teamHealthMeeting.id} />
              ) : (
                <TeamHealthIntroPhase
                  meeting={null}
                  gotoStageId={() => {}}
                  retroMeeting={meeting}
                />
              )}
            </div>
          </div>
        </PhaseWrapper>
      </MeetingHeaderAndPhase>
    </MeetingContent>
  )
}

export default RetroTeamHealthPhase
