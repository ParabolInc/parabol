import styled from '@emotion/styled'
import type {ReactElement, ReactNode} from 'react'
import type {StageTimerDisplay_meeting$key} from '~/__generated__/StageTimerDisplay_meeting.graphql'
import type {TaskColumns_tasks$key} from '~/__generated__/TaskColumns_tasks.graphql'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingPhaseWrapper from './MeetingPhaseWrapper'
import MeetingTopBar from './MeetingTopBar'
import PhaseWrapper from './PhaseWrapper'
import StageTimerDisplay from './StageTimerDisplay'
import PhaseCompleteTag from './Tag/PhaseCompleteTag'
import TaskColumns from './TaskColumns/TaskColumns'

const StyledColumnsWrapper = styled(MeetingPhaseWrapper)({
  position: 'relative'
})

// InnerColumnsWrapper is a patch fix to ensure correct
// behavior for task columns overflow in small viewports
const InnerColumnsWrapper = styled('div')({
  display: 'flex',
  overflow: 'auto',
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
})

interface Props {
  avatarGroup: ReactElement
  endedAt: Date | string | null | undefined
  headerPrompt: ReactNode
  isPhaseComplete: boolean
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
    isPhaseComplete,
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
          <PhaseCompleteTag isComplete={isPhaseComplete} />
          <StageTimerDisplay meeting={meetingRef} />
          <StyledColumnsWrapper>
            <InnerColumnsWrapper>
              <TaskColumns
                area='meeting'
                isViewerMeetingSection={isViewerStageOwner}
                meetingId={meetingId}
                myTeamMemberId={myTeamMemberId}
                tasks={tasks}
                teams={null}
              />
            </InnerColumnsWrapper>
          </StyledColumnsWrapper>
        </PhaseWrapper>
      </MeetingHeaderAndPhase>
    </MeetingContent>
  )
}

export default MeetingUpdatesContent
