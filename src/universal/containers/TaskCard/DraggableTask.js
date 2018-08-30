// @flow
import type {Node} from 'react'
import React, {Component} from 'react'
import {findDOMNode} from 'react-dom'
import {createFragmentContainer, graphql} from 'react-relay'
import NullableTask from 'universal/components/NullableTask/NullableTask'
import {TASK} from 'universal/utils/constants'
import {DragSource as dragSource, DropTarget as dropTarget} from '@mattkrick/react-dnd'
import {getEmptyImage} from '@mattkrick/react-dnd-html5-backend'
import TaskDragLayer from './TaskDragLayer'
import type {DraggableTask_task as Task} from '__generated__/DraggableTask_task.graphql'
const importantTaskProps = ['content', 'status', 'assignee', 'sortOrder', 'integration']

type Props = {
  area: string,
  connectDragSource: (node: Node) => Node,
  connectDragPreview: (node: Node) => Node,
  connectDropTarget: (node: Node) => Node,
  getTaskById: (string) => Task,
  insert: (task: Task, before: boolean) => void,
  isDragging: boolean,
  isPreview: boolean,
  myUserId: string,
  task: Task
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
    const {area, connectDragSource, connectDropTarget, isDragging, myUserId, task} = this.props
    return connectDropTarget(
      connectDragSource(
        <div style={{marginBottom: '.625rem'}}>
          {isDragging && <TaskDragLayer area={area} task={task} />}
          <div style={{opacity: isDragging ? 0.5 : 1}}>
            <NullableTask area={area} task={task} myUserId={myUserId} isDragging={isDragging} />
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
  const dropTargetDOMNode = findDOMNode(component) // eslint-disable-line react/no-find-dom-node
  if (!dropTargetDOMNode || dropTargetDOMNode instanceof window.Text) {
    return
  }
  // $FlowFixMe
  const {top: dropTargetTop, height: dropTargetHeight} = dropTargetDOMNode.getBoundingClientRect()
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
  graphql`
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
)
