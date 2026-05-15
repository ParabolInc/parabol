import type {ReactElement, ReactNode} from 'react'
import type {StageTimerDisplay_meeting$key} from '~/__generated__/StageTimerDisplay_meeting.graphql'
import type {TaskColumns_tasks$key} from '~/__generated__/TaskColumns_tasks.graphql'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingPhaseWrapper from './MeetingPhaseWrapper'
import MeetingTopBar from './MeetingTopBar'
import PhaseWrapper from './PhaseWrapper'
import StageTimerDisplay from './StageTimerDisplay'
import TaskColumns from './TaskColumns/TaskColumns'

interface Props {
  avatarGroup: ReactElement
  endedAt: Date | string | null | undefined
  headerPrompt: ReactNode
  isViewerStageOwner: boolean
  meetingId: string
  meetingRef: StageTimerDisplay_meeting$key
  myTeamMemberId: string
  showSidebar: boolean
  tasks: TaskColumns_tasks$key
  toggleSidebar: () => void
}

const MeetingUpdatesContent = (props: Props) => {
  const {
    avatarGroup,
    endedAt,
    headerPrompt,
    isViewerStageOwner,
    meetingId,
    meetingRef,
    myTeamMemberId,
    showSidebar,
    tasks,
    toggleSidebar
  } = props
  return (
    <MeetingContent>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          {headerPrompt}
        </MeetingTopBar>
        <PhaseWrapper>
          <StageTimerDisplay meeting={meetingRef} />
          {/* MeetingPhaseWrapper provides the flex/overflow base; relative + absolute inner
              keeps task columns from shifting layout when a horizontal scrollbar appears in
              small viewports. */}
          <MeetingPhaseWrapper className='relative'>
            <div className='absolute inset-0 flex overflow-auto'>
              <TaskColumns
                area='meeting'
                isViewerMeetingSection={isViewerStageOwner}
                meetingId={meetingId}
                myTeamMemberId={myTeamMemberId}
                tasks={tasks}
                teams={null}
              />
            </div>
          </MeetingPhaseWrapper>
        </PhaseWrapper>
      </MeetingHeaderAndPhase>
    </MeetingContent>
  )
}

export default MeetingUpdatesContent
