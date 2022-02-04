import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {Draggable, DraggableProvided, DraggableStateSnapshot} from 'react-beautiful-dnd'
import {createFragmentContainer} from 'react-relay'
import {AreaEnum, TaskStatusEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import NullableTask from '../../components/NullableTask/NullableTask'
import {DraggableTask_task} from '../../__generated__/DraggableTask_task.graphql'

const DraggableStyles = styled('div')({
  // sometimes the default blue fuzzies show up around the containing div
  outline: 'none',
  padding: `6px 12px`
})

interface Props {
  area: AreaEnum
  idx: number
  task: DraggableTask_task
  isMyMeetingSection?: boolean
  meetingId?: string
}

const DraggableTask = (props: Props) => {
  const {area, idx, task, isMyMeetingSection, meetingId} = props
  return (
    <Draggable draggableId={task.id} index={idx} disableInteractiveElementBlocking={false}>
      {(dragProvided: DraggableProvided, dragSnapshot: DraggableStateSnapshot) => (
        <DraggableStyles
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
          {...dragProvided.dragHandleProps}
        >
          <NullableTask
            dataCy={`draggable-task`}
            area={area}
            task={task}
            isDraggingOver={dragSnapshot.draggingOver as TaskStatusEnum}
            isMyMeetingSection={isMyMeetingSection}
            meetingId={meetingId}
          />
        </DraggableStyles>
      )}
    </Draggable>
  )
}

export default createFragmentContainer(DraggableTask, {
  task: graphql`
    fragment DraggableTask_task on Task {
      ...NullableTask_task
      id
      content
      status
      sortOrder
    }
  `
})
