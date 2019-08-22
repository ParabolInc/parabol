import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {DraggableReflectionCard_reflection} from '../../__generated__/DraggableReflectionCard_reflection.graphql'
import styled from '@emotion/styled'
import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  Droppable,
  DroppableProvided,
  DroppableStateSnapshot
} from 'react-beautiful-dnd'
import ReflectionCard from '../ReflectionCard/ReflectionCard'
import {DraggableReflectionCard_meeting} from '__generated__/DraggableReflectionCard_meeting.graphql'
import {DroppableType} from '../../types/constEnums'

const DraggableStyles = styled('div')({
  padding: `6px 12px`
})

interface Props {
  idx: number
  isDraggable: boolean
  meeting: DraggableReflectionCard_meeting
  reflection: DraggableReflectionCard_reflection
}

const DraggableReflectionCard = (props: Props) => {
  const {idx, reflection} = props
  const {id: reflectionId} = reflection
  return (
    <Droppable
      droppableId={reflectionId}
      type={DroppableType.REFLECTION}
      isCombineOnly
    >
      {(
        dropProvided: DroppableProvided,
        dropSnapshot: DroppableStateSnapshot
      ) => (
        <Draggable draggableId={reflectionId} index={idx}>
          {(
            dragProvided: DraggableProvided,
            dragSnapshot: DraggableStateSnapshot
          ) => (
            <div isDraggingover={dropSnapshot.isDraggingOver} {...dropProvided.droppableProps}
                 ref={dropProvided.innerRef}>
              <DraggableStyles
                ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}>
                <ReflectionCard readOnly userSelect='none' reflection={reflection} showOriginFooter />
              </DraggableStyles>
              {dropProvided.placeholder}

            </div>

          )}
        </Draggable>
      )}
    </Droppable>
  )
}

export default createFragmentContainer(DraggableReflectionCard,
  {
    reflection: graphql`
      fragment DraggableReflectionCard_reflection on RetroReflection {
        ...ReflectionCard_reflection
        id
      }
    `,
    meeting: graphql`
      fragment DraggableReflectionCard_meeting on RetrospectiveMeeting {
        id
      }`
  }
)
