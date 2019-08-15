import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import NullableTask from '../../components/NullableTask/NullableTask'
import {DraggableTask_task} from '../../__generated__/DraggableTask_task.graphql'
import {AreaEnum, TaskStatusEnum} from '../../types/graphql'
import styled from '@emotion/styled'
import {Draggable, DraggableProvided, DraggableStateSnapshot} from 'react-beautiful-dnd'

const DraggableStyles = styled('div')({
  padding: `6px 12px`
})

interface Props {
  area: AreaEnum
  idx: number
  task: DraggableTask_task
}

const DraggableTask = (props: Props) => {
  const {area, idx, task} = props
  return (
    <Draggable draggableId={task.id} index={idx} disableInteractiveElementBlocking={false}>
      {(
        dragProvided: DraggableProvided,
        dragSnapshot: DraggableStateSnapshot
      ) => (
        <DraggableStyles ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}>
          <NullableTask area={area} task={task} isDraggingOver={dragSnapshot.draggingOver as TaskStatusEnum} />
        </DraggableStyles>
      )}
    </Draggable>
  )
}

export default createFragmentContainer(DraggableTask,
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
