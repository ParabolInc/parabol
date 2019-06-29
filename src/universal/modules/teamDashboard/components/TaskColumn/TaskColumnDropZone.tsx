import React, {ReactElement} from 'react'
import {DropTarget} from 'react-dnd'

import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import sortOrderBetween from 'universal/dnd/sortOrderBetween'
import UpdateTaskMutation from 'universal/mutations/UpdateTaskMutation'
import {AreaEnum, ITask, IUpdateTaskInput, TaskStatusEnum} from 'universal/types/graphql'
import {TASK} from 'universal/utils/constants'

interface Props extends WithAtmosphereProps {
  connectDropTarget: (reactEl: ReactElement<HTMLDivElement>) => ReactElement<HTMLDivElement>
  area: AreaEnum
  getTaskById: (taskId: string) => ITask
  lastTask?: ITask // the last task in a column; may be undefined if the column is empty
  status: TaskStatusEnum
}

// Represents the trailing space at the end of a column.  Acts as a drop target
// for cards being dragged over a column rather than cards in that column.
const TaskColumnDropZone = (props: Props) =>
  props.connectDropTarget(<div style={{height: '100%'}} />)

const spec = {
  hover: (props: Props, monitor) => {
    const {area, atmosphere, getTaskById, lastTask, status} = props
    const draggedTaskId = monitor.getItem().taskId
    const draggedTask = getTaskById(draggedTaskId)

    if (!monitor.isOver({shallow: true})) {
      return
    }
    if (lastTask && draggedTask.id === lastTask.id) {
      return
    }

    const sortOrder = sortOrderBetween(lastTask, null, draggedTask, false)

    const updatedTask = {
      id: draggedTask.id,
      sortOrder
    } as IUpdateTaskInput
    if (draggedTask.status !== status) {
      updatedTask.status = status
    }
    UpdateTaskMutation(atmosphere, {updatedTask, area})
  }
}

const collect = (connect) => ({
  connectDropTarget: connect.dropTarget()
})

const DND = DropTarget(TASK, spec, collect) as any
export default withAtmosphere(DND(TaskColumnDropZone)) as any
