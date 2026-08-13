import {Droppable, type DroppableProvided, type DroppableStateSnapshot} from '@hello-pangea/dnd'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {TaskColumn_teams$key} from '~/__generated__/TaskColumn_teams.graphql'
import type {AreaEnum, TaskStatusEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import type {TaskColumn_tasks$key} from '../../../../__generated__/TaskColumn_tasks.graphql'
import {DroppableType} from '../../../../types/constEnums'
import {cn} from '../../../../ui/cn'
import {DONE, TEAM_DASH, USER_DASH} from '../../../../utils/constants'
import {taskStatusLabels} from '../../../../utils/taskStatus'
import ArchiveAllDoneTasksModal from './ArchiveAllDoneTasksModal'
import TaskColumnAddTask from './TaskColumnAddTask'
import TaskColumnInner from './TaskColumnInner'

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
        <div
          className={cn(
            'relative flex flex-1 flex-col transition-[background] duration-300 ease-[cubic-bezier(0,0,.2,1)]',
            dropSnapshot.isDraggingOver && 'bg-surface-well'
          )}
        >
          <div className='flex! relative min-w-[256px] border-hairline border-b-2 p-3 text-fg-primary leading-6'>
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
            <div
              className={cn('flex flex-1 items-center text-[16px]', userCanAdd ? 'ml-2' : 'ml-4')}
            >
              <div className='font-semibold capitalize'>{label}</div>
              {tasks.length > 0 && <div className='ml-2 text-fg-muted'>{tasks.length}</div>}
              {status === DONE && (
                <a
                  onClick={() => setIsArchiveOpen(true)}
                  className='ml-auto cursor-pointer text-fg-secondary text-sm'
                >
                  Archive all
                </a>
              )}
            </div>
            <ArchiveAllDoneTasksModal
              isOpen={isArchiveOpen}
              closeModal={() => setIsArchiveOpen(false)}
              taskIds={tasks.map((t) => t.id)}
            />
          </div>
          <div
            className='h-full min-h-[200px] flex-1 overflow-y-auto overflow-x-hidden pb-2'
            {...dropProvided.droppableProps}
            ref={dropProvided.innerRef}
          >
            <TaskColumnInner
              area={area}
              tasks={tasks}
              isViewerMeetingSection={isViewerMeetingSection}
              meetingId={meetingId}
            />
            {dropProvided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  )
}

export default TaskColumn
