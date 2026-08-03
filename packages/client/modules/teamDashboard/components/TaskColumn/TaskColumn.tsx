import styled from '@emotion/styled'
import {Droppable, type DroppableProvided, type DroppableStateSnapshot} from '@hello-pangea/dnd'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {TaskColumn_teams$key} from '~/__generated__/TaskColumn_teams.graphql'
import type {AreaEnum, TaskStatusEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import type {TaskColumn_tasks$key} from '../../../../__generated__/TaskColumn_tasks.graphql'
import {BezierCurve, DroppableType} from '../../../../types/constEnums'
import {DONE, TEAM_DASH, USER_DASH} from '../../../../utils/constants'
import {taskStatusLabels} from '../../../../utils/taskStatus'
import ArchiveAllDoneTasksModal from './ArchiveAllDoneTasksModal'
import TaskColumnAddTask from './TaskColumnAddTask'
import TaskColumnInner from './TaskColumnInner'

const Column = styled('div')<{isDragging: boolean}>(({isDragging}) => ({
  background: isDragging ? 'var(--color-surface-well)' : undefined,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  position: 'relative',
  transition: `background 300ms ${BezierCurve.DECELERATE}`
}))

const ColumnHeader = styled('div')({
  color: 'var(--color-fg-primary)',
  display: 'flex !important',
  lineHeight: '24px',
  padding: 12,
  position: 'relative',
  minWidth: '256px'
})

const ColumnBody = styled('div')({
  flex: 1,
  height: '100%',
  overflowX: 'hidden',
  overflowY: 'auto',
  minHeight: 200,
  paddingBottom: 8
})

const StatusLabel = styled('div')({
  fontWeight: 600,
  textTransform: 'capitalize'
})

const TasksCount = styled('div')({
  color: 'var(--color-fg-muted)',
  marginLeft: 8
})

const StatusLabelBlock = styled('div')<{userCanAdd: boolean | undefined}>(({userCanAdd}) => ({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  fontSize: 16,
  marginLeft: userCanAdd ? 8 : 16
}))

interface Props {
  area: AreaEnum
  isViewerMeetingSection?: boolean
  meetingId?: string
  myTeamMemberId?: string
  tasks: TaskColumn_tasks$key
  status: TaskStatusEnum
  teamMemberFilterId?: string | null
  teams: TaskColumn_teams$key | null | undefined
}

const TaskColumn = (props: Props) => {
  const {
    area,
    isViewerMeetingSection,
    meetingId,
    myTeamMemberId,
    teamMemberFilterId,
    status,
    tasks: tasksRef,
    teams: teamsRef
  } = props
  const tasks = useFragment(
    graphql`
      fragment TaskColumn_tasks on Task
      @relay(plural: true)
      @argumentDefinitions(meetingId: {type: "ID"}) {
        ...TaskColumnAddTask_tasks
        ...TaskColumnInner_tasks @arguments(meetingId: $meetingId)
        id
      }
    `,
    tasksRef
  )
  const teams = useFragment(
    graphql`
      fragment TaskColumn_teams on Team @relay(plural: true) {
        ...TaskColumnAddTask_teams
      }
    `,
    teamsRef
  )
  const label = taskStatusLabels[status]
  const userCanAdd = area === TEAM_DASH || area === USER_DASH || isViewerMeetingSection
  const [isArchiveOpen, setIsArchiveOpen] = useState(false)
  return (
    <Droppable droppableId={status} type={DroppableType.TASK}>
      {(dropProvided: DroppableProvided, dropSnapshot: DroppableStateSnapshot) => (
        <Column isDragging={dropSnapshot.isDraggingOver}>
          <ColumnHeader className='border-hairline border-b-2'>
            <TaskColumnAddTask
              area={area}
              isViewerMeetingSection={isViewerMeetingSection}
              status={status}
              tasks={tasks}
              meetingId={meetingId}
              myTeamMemberId={myTeamMemberId}
              teamMemberFilterId={teamMemberFilterId || ''}
              teams={teams}
            />
            <StatusLabelBlock userCanAdd={userCanAdd}>
              <StatusLabel>{label}</StatusLabel>
              {tasks.length > 0 && <TasksCount>{tasks.length}</TasksCount>}
              {status === DONE && (
                <a
                  onClick={() => setIsArchiveOpen(true)}
                  className='ml-auto cursor-pointer text-fg-secondary text-sm'
                >
                  Archive all
                </a>
              )}
            </StatusLabelBlock>
            <ArchiveAllDoneTasksModal
              isOpen={isArchiveOpen}
              closeModal={() => setIsArchiveOpen(false)}
              taskIds={tasks.map((t) => t.id)}
            />
          </ColumnHeader>
          <ColumnBody {...dropProvided.droppableProps} ref={dropProvided.innerRef}>
            <TaskColumnInner
              area={area}
              tasks={tasks}
              isViewerMeetingSection={isViewerMeetingSection}
              meetingId={meetingId}
            />
            {dropProvided.placeholder}
          </ColumnBody>
        </Column>
      )}
    </Droppable>
  )
}

export default TaskColumn
