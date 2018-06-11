import styled, {css} from 'react-emotion'
import PropTypes from 'prop-types'
import React, {Component} from 'react'
import withScrolling from 'react-dnd-scrollzone'
import {connect} from 'react-redux'
import {withRouter} from 'react-router'
import AddTaskButton from 'universal/components/AddTaskButton/AddTaskButton'
import DraggableTask from 'universal/containers/TaskCard/DraggableTask'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import sortOrderBetween from 'universal/dnd/sortOrderBetween'
import CreateTaskMutation from 'universal/mutations/CreateTaskMutation'
import UpdateTaskMutation from 'universal/mutations/UpdateTaskMutation'
import appTheme from 'universal/styles/theme/appTheme'
import themeLabels from 'universal/styles/theme/labels'
import ui from 'universal/styles/ui'
import {TEAM_DASH, USER_DASH} from 'universal/utils/constants'
import dndNoise from 'universal/utils/dndNoise'
import getNextSortOrder from 'universal/utils/getNextSortOrder'
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId'

import TaskColumnDropZone from './TaskColumnDropZone'
import MenuItem from 'universal/modules/menu/components/MenuItem/MenuItem'
import MenuContainer from 'universal/modules/menu/containers/Menu/MenuContainer'
import overflowTouch from 'universal/styles/helpers/overflowTouch'

// The `ScrollZone` component manages an overflowed block-level element,
// scrolling its contents when another element is dragged close to its edges.
const ScrollZone = withScrolling('div')

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
}

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
}

const handleAddTaskFactory = (atmosphere, status, teamId, userId, sortOrder) => () => {
  const newTask = {
    status,
    teamId,
    userId,
    sortOrder
  }
  CreateTaskMutation(atmosphere, newTask)
}

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

const columnInner = {
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
}

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
    dispatch: PropTypes.func.isRequired,
    firstColumn: PropTypes.bool,
    getTaskById: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    isMyMeetingSection: PropTypes.bool,
    lastColumn: PropTypes.bool,
    myTeamMemberId: PropTypes.string,
    tasks: PropTypes.array.isRequired,
    status: PropTypes.string,
    teamMemberFilterId: PropTypes.string,
    teams: PropTypes.array
  }

  makeAddTask = () => {
    const {
      area,
      atmosphere,
      dispatch,
      history,
      isMyMeetingSection,
      status,
      tasks,
      myTeamMemberId,
      teamMemberFilterId,
      teams
    } = this.props
    const label = themeLabels.taskStatus[status].slug
    const sortOrder = getNextSortOrder(tasks, dndNoise())
    if (area === TEAM_DASH || isMyMeetingSection) {
      const {userId, teamId} = fromTeamMemberId(teamMemberFilterId || myTeamMemberId)
      const handleAddTask = handleAddTaskFactory(atmosphere, status, teamId, userId, sortOrder)
      return <AddTaskButton onClick={handleAddTask} label={label} />
    } else if (area === USER_DASH) {
      if (teams.length === 1) {
        const {id: teamId} = teams[0]
        const {userId} = atmosphere
        const handleAddTask = handleAddTaskFactory(atmosphere, status, teamId, userId, sortOrder)
        return <AddTaskButton onClick={handleAddTask} label={label} />
      }
      const itemFactory = () => {
        const menuItems = this.makeTeamMenuItems(atmosphere, dispatch, history, sortOrder)
        return menuItems.map((item) => (
          <MenuItem key={`MenuItem${item.label}`} label={item.label} onClick={item.handleClick} />
        ))
      }

      const toggle = <AddTaskButton label={label} />
      return (
        <MenuContainer
          itemFactory={itemFactory}
          originAnchor={originAnchor}
          maxHeight={ui.dashMenuHeight}
          menuWidth={ui.dashMenuWidth}
          targetAnchor={targetAnchor}
          toggle={toggle}
          label='Select Team:'
        />
      )
    }
    return null
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

  makeTeamMenuItems = (atmosphere, dispatch, history, sortOrder) => {
    const {status, teams} = this.props
    const {userId} = atmosphere
    return teams.map((team) => ({
      label: team.name,
      handleClick: () => {
        const newTask = {
          sortOrder,
          status,
          teamId: team.id,
          userId
        }
        CreateTaskMutation(atmosphere, newTask)
      }
    }))
  }

  render () {
    const {
      area,
      atmosphere,
      firstColumn,
      getTaskById,
      isMyMeetingSection,
      lastColumn,
      status,
      tasks
    } = this.props
    const label = themeLabels.taskStatus[status].slug
    const userCanAdd = area === 'TEAM_DASH' || area === 'USER_DASH' || isMyMeetingSection
    const statusLabelBlockStyles = css(statusLabelBlock, userCanAdd && statusLabelBlockUserCanAdd)

    return (
      <Column firstColumn={firstColumn} lastColumn={lastColumn}>
        <ColumnHeader>
          {this.makeAddTask()}
          <div className={statusLabelBlockStyles}>
            <StatusLabel>{label}</StatusLabel>
            {tasks.length > 0 && <TasksCount>{tasks.length}</TasksCount>}
          </div>
        </ColumnHeader>
        <ColumnBody>
          <ScrollZone className={css(columnInner)}>
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

export default connect()(withAtmosphere(withRouter(TaskColumn)))
