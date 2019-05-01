import styled, {css} from 'react-emotion'
import PropTypes from 'prop-types'
import React, {Component} from 'react'
import withScrolling from 'react-dnd-scrollzone'
import DraggableTask from 'universal/containers/TaskCard/DraggableTask'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import sortOrderBetween from 'universal/dnd/sortOrderBetween'
import UpdateTaskMutation from 'universal/mutations/UpdateTaskMutation'
import appTheme from 'universal/styles/theme/appTheme'
import themeLabels from 'universal/styles/theme/labels'
import ui from 'universal/styles/ui'
import {TEAM_DASH, USER_DASH} from 'universal/utils/constants'
import TaskColumnDropZone from './TaskColumnDropZone'
import overflowTouch from 'universal/styles/helpers/overflowTouch'
import TaskColumnAddTask from 'universal/modules/teamDashboard/components/TaskColumn/TaskColumnAddTask'

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

class TaskColumn extends Component {
  static propTypes = {
    area: PropTypes.string,
    atmosphere: PropTypes.object.isRequired,
    firstColumn: PropTypes.bool,
    getTaskById: PropTypes.func.isRequired,
    isMyMeetingSection: PropTypes.bool,
    lastColumn: PropTypes.bool,
    myTeamMemberId: PropTypes.string,
    tasks: PropTypes.array.isRequired,
    status: PropTypes.string,
    teamMemberFilterId: PropTypes.string,
    teams: PropTypes.array
  }

  taskIsInPlace = (draggedTask, targetTask, before) => {
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
  insertTask = (draggedTask, targetTask, before) => {
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
      updatedTask.status = targetTask.status
    }
    UpdateTaskMutation(atmosphere, updatedTask, area)
  }

  render () {
    const {
      area,
      atmosphere,
      firstColumn,
      getTaskById,
      isMyMeetingSection,
      myTeamMemberId,
      teamMemberFilterId,
      lastColumn,
      status,
      tasks,
      teams
    } = this.props
    const label = themeLabels.taskStatus[status].slug
    const userCanAdd = area === TEAM_DASH || area === USER_DASH || isMyMeetingSection
    const statusLabelBlockStyles = css(statusLabelBlock, userCanAdd && statusLabelBlockUserCanAdd)

    return (
      <Column firstColumn={firstColumn} lastColumn={lastColumn}>
        <ColumnHeader>
          <TaskColumnAddTask
            area={area}
            isMyMeetingSection={isMyMeetingSection}
            status={status}
            tasks={tasks}
            myTeamMemberId={myTeamMemberId}
            teamMemberFilterId={teamMemberFilterId}
            teams={teams}
          />
          <div className={statusLabelBlockStyles}>
            <StatusLabel>{label}</StatusLabel>
            {tasks.length > 0 && <TasksCount>{tasks.length}</TasksCount>}
          </div>
        </ColumnHeader>
        <ColumnBody>
          <ScrollZone>
            {tasks.map((task) => (
              <DraggableTask
                key={`teamCard${task.id}`}
                area={area}
                getTaskById={getTaskById}
                task={task}
                myUserId={atmosphere.userId}
                insert={(draggedTask, before) => this.insertTask(draggedTask, task, before)}
              />
            ))}
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

export default withAtmosphere(TaskColumn)
