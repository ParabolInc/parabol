import React, {Component} from 'react'
import withScrolling from 'react-dnd-scrollzone'
import styled, {css} from 'react-emotion'
import DraggableTask from 'universal/containers/TaskCard/DraggableTask'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import sortOrderBetween from 'universal/dnd/sortOrderBetween'
import TaskColumnAddTask from 'universal/modules/teamDashboard/components/TaskColumn/TaskColumnAddTask'
import UpdateTaskMutation from 'universal/mutations/UpdateTaskMutation'
import overflowTouch from 'universal/styles/helpers/overflowTouch'
import appTheme from 'universal/styles/theme/appTheme'
import themeLabels from 'universal/styles/theme/labels'
import ui from 'universal/styles/ui'
import {AreaEnum, ITask, TaskStatusEnum} from 'universal/types/graphql'
import {TEAM_DASH, USER_DASH} from 'universal/utils/constants'
import TaskColumnDropZone from './TaskColumnDropZone'
import {createFragmentContainer, graphql} from 'react-relay'
import {TaskColumn_tasks} from '__generated__/TaskColumn_tasks.graphql'

const Column = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  overflow: 'auto',
  position: 'relative',
  width: '25%'
})

const ColumnHeader = styled('div')({
  color: appTheme.palette.dark,
  display: 'flex !important',
  lineHeight: '1.5rem',
  padding: `.625rem ${ui.taskColumnPaddingInnerSmall} .5rem`,
  position: 'relative',
  [ui.dashBreakpoint]: {
    paddingLeft: ui.taskColumnPaddingInnerLarge,
    paddingRight: ui.taskColumnPaddingInnerLarge
  }
})

const ColumnBody = styled('div')({
  flex: 1,
  position: 'relative'
})

const ColumnInner = styled('div')({
  ...overflowTouch,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: `.125rem ${ui.taskColumnPaddingInnerSmall} 0`,
  position: 'absolute',
  width: '100%',
  [ui.dashBreakpoint]: {
    paddingLeft: ui.taskColumnPaddingInnerLarge,
    paddingRight: ui.taskColumnPaddingInnerLarge
  },
  '&::-webkit-scrollbar-thumb': {
    // Define
  }
})

// The `ScrollZone` component manages an overflowed block-level element,
// scrolling its contents when another element is dragged close to its edges.
const ScrollZone = withScrolling(ColumnInner)

const statusLabelBlock = {
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  fontSize: '1.0625rem',
  marginLeft: '.9375rem'
}

const statusLabelBlockUserCanAdd = {
  marginLeft: '.5625rem'
}

const StatusLabel = styled('div')({
  fontWeight: 600,
  textTransform: 'capitalize'
})

const TasksCount = styled('div')({
  color: appTheme.palette.dark40a,
  marginLeft: '.5rem'
})

interface Props extends WithAtmosphereProps {
  area: AreaEnum
  getTaskById: (taskId: string) => Partial<ITask> | undefined | null
  isMyMeetingSection?: boolean
  meetingId?: string
  myTeamMemberId?: string
  tasks: TaskColumn_tasks
  status: TaskStatusEnum
  teamMemberFilterId?: string
  teams: any[]
}

type Task = TaskColumn_tasks[0]
class TaskColumn extends Component<Props> {
  taskIsInPlace = (draggedTask: Task, targetTask: Task, before) => {
    const {tasks} = this.props
    const targetIndex = tasks.findIndex((p) => p.id === targetTask.id)
    const boundingTask = tasks[targetIndex + (before ? -1 : 1)]
    return Boolean(boundingTask && boundingTask.id === draggedTask.id)
  }

  /**
   * `draggedTask` - task being dragged-and-dropped
   * `targetTask` - the task being "dropped on"
   * `before` - whether the dragged task is being inserted before (true) or
   * after (false) the target task.
   */
  insertTask = (draggedTask: Task, targetTask: Task, before) => {
    if (this.taskIsInPlace(draggedTask, targetTask, before)) {
      return
    }
    const {area, atmosphere, tasks} = this.props
    const targetIndex = tasks.findIndex((p) => p.id === targetTask.id)
    // `boundingTask` is the task which sandwiches the dragged task on
    // the opposite side of the target task.  When the target task is in
    // the front or back of the list, this will be `undefined`.
    const boundingTask = tasks[targetIndex + (before ? -1 : 1)]
    const sortOrder = sortOrderBetween(targetTask, boundingTask, draggedTask, before)
    const updatedTask = {id: draggedTask.id, sortOrder}
    if (draggedTask.status !== targetTask.status) {
      (updatedTask as any).status = targetTask.status
    }
    UpdateTaskMutation(atmosphere, {updatedTask, area})
  }

  render () {
    const {
      area,
      atmosphere,
      getTaskById,
      isMyMeetingSection,
      meetingId,
      myTeamMemberId,
      teamMemberFilterId,
      status,
      tasks,
      teams
    } = this.props
    const label = themeLabels.taskStatus[status].slug
    const userCanAdd = area === TEAM_DASH || area === USER_DASH || isMyMeetingSection
    const statusLabelBlockStyles = css(statusLabelBlock, userCanAdd && statusLabelBlockUserCanAdd)

    return (
      <Column>
        <ColumnHeader>
          <TaskColumnAddTask
            area={area}
            isMyMeetingSection={isMyMeetingSection}
            status={status}
            tasks={tasks}
            meetingId={meetingId}
            myTeamMemberId={myTeamMemberId}
            teamMemberFilterId={teamMemberFilterId || ''}
            teams={teams}
          />
          <div className={statusLabelBlockStyles}>
            <StatusLabel>{label}</StatusLabel>
            {tasks.length > 0 && <TasksCount>{tasks.length}</TasksCount>}
          </div>
        </ColumnHeader>
        <ColumnBody>
          <ScrollZone>
            {tasks.map((task) => {
              return (
                <DraggableTask
                  key={`teamCard${task.id}`}
                  area={area}
                  getTaskById={getTaskById}
                  task={task}
                  myUserId={atmosphere.userId}
                  insert={(draggedTask: Task, before) => this.insertTask(draggedTask, task, before)}
                />
              )
            })}
            <TaskColumnDropZone
              area={area}
              getTaskById={getTaskById}
              lastTask={tasks[tasks.length - 1]}
              status={status}
            />
          </ScrollZone>
        </ColumnBody>
      </Column>
    )
  }
}

export default createFragmentContainer(
  withAtmosphere(TaskColumn),
  graphql`
    fragment TaskColumn_tasks on Task @relay(plural: true) {
      ...TaskColumnAddTask_tasks
      ...DraggableTask_task
      id
      sortOrder
      status
    }
  `
)
