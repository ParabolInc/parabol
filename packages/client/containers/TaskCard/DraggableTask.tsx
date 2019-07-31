import React, {Component, ReactElement} from 'react'
import {findDOMNode} from 'react-dom'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import NullableTask from '../../components/NullableTask/NullableTask'
import {TASK} from '../../utils/constants'
import {DragSource as dragSource, DropTarget as dropTarget} from 'react-dnd'
import {getEmptyImage} from 'react-dnd-html5-backend'
import TaskDragLayer from './TaskDragLayer'
import {DraggableTask_task} from '../../__generated__/DraggableTask_task.graphql'

const importantTaskProps = ['content', 'status', 'assignee', 'sortOrder', 'integration']

interface Props {
  area: string
  connectDragSource: (reactEl: ReactElement<{}>) => ReactElement<{}>
  connectDragPreview: (reactEl: HTMLImageElement) => void
  connectDropTarget: (reactEl: ReactElement<{}>) => ReactElement<{}>
  getTaskById: (taskId: string) => DraggableTask_task
  insert: (task: DraggableTask_task, before: boolean) => void
  isDragging: boolean
  isPreview: boolean
  task: DraggableTask_task
}

class DraggableTask extends Component<Props> {
  componentDidMount () {
    const {connectDragPreview, isPreview} = this.props
    if (!isPreview) {
      connectDragPreview(getEmptyImage())
    }
  }

  shouldComponentUpdate (nextProps) {
    const {isDragging} = nextProps
    for (let i = 0; i < importantTaskProps.length; i++) {
      const key = importantTaskProps[i]
      if (nextProps.task[key] !== this.props.task[key]) {
        return true
      }
    }
    return isDragging !== this.props.isDragging
  }

  render () {
    const {area, connectDragSource, connectDropTarget, isDragging, task} = this.props
    return connectDropTarget(
      connectDragSource(
        <div style={{marginBottom: '.625rem'}}>
          {isDragging && <TaskDragLayer task={task} />}
          <div style={{opacity: isDragging ? 0.5 : 1}}>
            <NullableTask area={area} task={task} isDragging={isDragging} />
          </div>
        </div>
      )
    )
  }
}

const taskDragSpec = {
  beginDrag (props) {
    return {taskId: props.task.id}
  },
  isDragging (props, monitor) {
    return props.task.id === monitor.getItem().taskId
  }
}

const taskDragCollect = (connectSource, monitor) => ({
  connectDragSource: connectSource.dragSource(),
  connectDragPreview: connectSource.dragPreview(),
  isDragging: monitor.isDragging()
})

const handleTaskHover = (props: Props, monitor, component) => {
  const {getTaskById, insert, task} = props
  const dropTargetTaskId = task.id
  const draggedTaskId = monitor.getItem().taskId
  const draggedTask = getTaskById(draggedTaskId)

  if (!monitor.isOver({shallow: true})) {
    return
  }

  if (draggedTaskId === dropTargetTaskId) {
    return
  }

  // Compute whether I am dropping "before" or "after" the card.
  const {y: mouseY} = monitor.getClientOffset()
  const dropTargetDOMNode = findDOMNode(component)
  if (!dropTargetDOMNode || dropTargetDOMNode instanceof (window as any).Text) {
    return
  }
  const {
    top: dropTargetTop,
    height: dropTargetHeight
  } = (dropTargetDOMNode as HTMLElement).getBoundingClientRect()
  const dropTargetMidpoint = dropTargetTop + dropTargetHeight / 2
  const before = mouseY < dropTargetMidpoint

  insert(draggedTask, before)
}

const taskDropCollect = (connect) => ({
  connectDropTarget: connect.dropTarget()
})

const taskDropSpec = {
  hover: handleTaskHover
}

export default createFragmentContainer(
  dragSource(TASK, taskDragSpec, taskDragCollect)(
    dropTarget(TASK, taskDropSpec, taskDropCollect)(DraggableTask)
  ),
  {
    task: graphql`
      fragment DraggableTask_task on Task {
        id
        content
        integration {
          service
        }
        status
        sortOrder
        assignee {
          id
        }
        ...NullableTask_task
      }
    `
  }
)
