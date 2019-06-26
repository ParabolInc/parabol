import {TimelinePriorityTasks_viewer} from '__generated__/TimelinePriorityTasks_viewer.graphql'
import memoize from 'micro-memoize'
import React, {Component} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import sortOrderBetween from 'universal/dnd/sortOrderBetween'
import UpdateTaskMutation from 'universal/mutations/UpdateTaskMutation'
import {ACTIVE, USER_DASH} from 'universal/utils/constants'
import DraggableTask from '../containers/TaskCard/DraggableTask'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import {PALETTE} from '../styles/paletteV2'
import {ICON_SIZE} from '../styles/typographyV2'
import {ITask} from '../types/graphql'
import getTaskById from '../utils/getTaskById'
import Icon from 'universal/components/Icon'
import TimelineNoTasks from './TimelineNoTasks'

interface Props extends WithAtmosphereProps {
  viewer: TimelinePriorityTasks_viewer
}

const PriorityTasksHeader = styled('div')({
  color: PALETTE.TEXT_LIGHT,
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 16
})

const ActiveIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18,
  verticalAlign: 'bottom',
  marginRight: 4
})

const TaskList = styled('div')({
  paddingTop: 32
})

class TimelinePriorityTasks extends Component<Props> {
  getActiveTasks = memoize((tasks: TimelinePriorityTasks_viewer['tasks']) => {
    const {edges} = tasks
    const nodes = edges.map((edge) => edge.node)
    return nodes
      .filter((node) => node.status === ACTIVE)
      .sort((a, b) => (a.sortOrder < b.sortOrder ? 1 : -1))
  })

  taskIsInPlace = (draggedTask, targetTask, before) => {
    const {viewer} = this.props
    const {tasks} = viewer
    const activeTasks = this.getActiveTasks(tasks)
    const targetIndex = activeTasks.findIndex((p) => p.id === targetTask.id)
    const boundingTask = activeTasks[targetIndex + (before ? -1 : 1)]
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
    const {atmosphere, viewer} = this.props
    const {tasks} = viewer
    const activeTasks = this.getActiveTasks(tasks)
    const targetIndex = activeTasks.findIndex((p) => p.id === targetTask.id)
    // `boundingTask` is the task which sandwiches the dragged task on
    // the opposite side of the target task.  When the target task is in
    // the front or back of the list, this will be `undefined`.
    const boundingTask = activeTasks[targetIndex + (before ? -1 : 1)]
    const sortOrder = sortOrderBetween(targetTask, boundingTask, draggedTask, before)
    const updatedTask = {id: draggedTask.id, sortOrder} as Partial<ITask>
    if (draggedTask.status !== targetTask.status) {
      updatedTask.status = targetTask.status
    }
    UpdateTaskMutation(atmosphere, updatedTask, USER_DASH)
  }

  render () {
    const {viewer} = this.props
    const {tasks} = viewer
    const activeTasks = this.getActiveTasks(tasks)
    if (activeTasks.length === 0) return <TimelineNoTasks />
    return (
      <TaskList>
        <PriorityTasksHeader>
          <ActiveIcon>whatshot</ActiveIcon>
          Active Tasks
        </PriorityTasksHeader>
        {activeTasks.map((task) => (
          <DraggableTask
            key={task.id}
            area={USER_DASH}
            getTaskById={getTaskById(activeTasks)}
            task={task}
            insert={(draggedTask, before) => this.insertTask(draggedTask, task, before)}
          />
        ))}
      </TaskList>
    )
  }
}

export default createFragmentContainer(
  withAtmosphere(TimelinePriorityTasks),
  graphql`
    fragment TimelinePriorityTasks_viewer on User {
      tasks(first: 1000) @connection(key: "UserColumnsContainer_tasks") {
        __typename
        edges {
          node {
            id
            content @__clientField(handle: "contentText")
            contentText
            status
            sortOrder
            team {
              id
            }
            ...DraggableTask_task
          }
        }
      }
    }
  `
)
