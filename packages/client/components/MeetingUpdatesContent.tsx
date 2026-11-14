import type {ReactElement, ReactNode} from 'react'
import type {StageTimerDisplay_meeting$key} from '~/__generated__/StageTimerDisplay_meeting.graphql'
import type {TaskColumns_tasks$key} from '~/__generated__/TaskColumns_tasks.graphql'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingPhaseWrapper from './MeetingPhaseWrapper'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderDescription from './PhaseHeaderDescription'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'
import ReviewTasksExampleRoot from './ReviewTasksExampleRoot'
import StageTimerDisplay from './StageTimerDisplay'
import TaskColumns from './TaskColumns/TaskColumns'

interface Props {
  avatarGroup: ReactElement
  emptyState: {title: string; description: string} | null
  endedAt: Date | string | null | undefined
  exampleTeamId?: string | null
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
    emptyState,
    endedAt,
    exampleTeamId,
    headerPrompt,
    isViewerStageOwner,
    meetingId,
    meetingRef,
    myTeamMemberId,
    showSidebar,
    tasks,
    toggleSidebar
  } = props
  const board = (
    <>
      <TaskColumns
        area='meeting'
        isViewerMeetingSection={isViewerStageOwner}
        meetingId={meetingId}
        myTeamMemberId={myTeamMemberId}
        tasks={tasks}
        teams={null}
      />
      {emptyState && (
        <div className='pointer-events-none absolute inset-x-0 top-[200px] flex flex-col items-center px-6 text-center'>
          <h2 className='font-semibold text-fg-primary text-xl leading-7'>{emptyState.title}</h2>
          <p className='mt-2 max-w-[570px] text-fg-secondary text-sm leading-5'>
            {emptyState.description}
          </p>
        </div>
      )}
    </>
  )
  const layout = (header: ReactNode, body: ReactNode) => (
    <MeetingContent>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          {header}
        </MeetingTopBar>
        <PhaseWrapper>
          <StageTimerDisplay meeting={meetingRef} />
          {/* MeetingPhaseWrapper provides the flex/overflow base; relative + absolute inner
              keeps task columns from shifting layout when a horizontal scrollbar appears in
              small viewports. */}
          <MeetingPhaseWrapper className='relative'>
            <div className='absolute inset-0 flex overflow-auto'>{body}</div>
          </MeetingPhaseWrapper>
        </PhaseWrapper>
      </MeetingHeaderAndPhase>
    </MeetingContent>
  )
  if (!exampleTeamId) return layout(headerPrompt, board)
  const teamHeader = (
    <>
      <PhaseHeaderTitle>Review Tasks</PhaseHeaderTitle>
      <PhaseHeaderDescription>Check on your team’s open tasks</PhaseHeaderDescription>
    </>
  )
  return (
    <ReviewTasksExampleRoot
      fallback={layout(null, null)}
      teamId={exampleTeamId}
      render={(example) => (example ? layout(teamHeader, example) : layout(headerPrompt, board))}
    />
  )
}

export default MeetingUpdatesContent
