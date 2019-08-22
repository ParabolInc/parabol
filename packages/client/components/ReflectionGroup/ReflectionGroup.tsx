import {ReflectionGroup_meeting} from '../../__generated__/ReflectionGroup_meeting.graphql'
import {ReflectionGroup_reflectionGroup} from '../../__generated__/ReflectionGroup_reflectionGroup.graphql'
import React, {useRef, useState} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {DroppableType, ReflectionStackPerspective} from '../../types/constEnums'
import useModal from '../../hooks/useModal'
import {NewMeetingPhaseTypeEnum} from '../../types/graphql'
import DraggableReflectionCard from './DraggableReflectionCard'
import {Elevation} from '../../styles/elevation'
import {Droppable, DroppableProvided, DroppableStateSnapshot} from 'react-beautiful-dnd'


// TODO reuse from ReflectionStack
const CardStack = styled('div')({
  // alignItems: 'flex-start',
  // display: 'flex',
  // flex: 1,
  // minHeight: ElementHeight.REFLECTION_CARD_MAX,
  // justifyContent: 'center'
  // position: 'relative'
})

const Group = styled('div')({
  position: 'relative',
  minHeight: 90,
  background: 'lightblue',
  border: '2px solid white'
})

const HIDE_LINES_HACK_STYLES = {
  background: '#fff',
  content: '""',
  height: 12,
  left: 0,
  position: 'absolute',
  right: 0,
  zIndex: 200
}

const CARD_IN_STACK = {
  backgroundColor: '#fff',
  borderRadius: 2,
  boxShadow: Elevation.Z4,
  cursor: 'pointer',
  overflow: 'hidden',
  position: 'absolute',
  pointerEvents: 'none',
  // hides partially overflown top lines of text
  '&::before': {
    ...HIDE_LINES_HACK_STYLES,
    top: 0
  },
  // hides partially overflown bottom lines of text
  '&::after': {
    ...HIDE_LINES_HACK_STYLES,
    bottom: 0
  },
  '& > div': {
    bottom: 0,
    boxShadow: 'none',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 100
  }
}

const CenteredCardStack = styled('div')({
  position: 'relative'
})

const ReflectionWrapper = styled('div')<{idx: number}>(
  ({idx}): any => {
    // return {
    // position: 'absolute',
    // zIndex: idx,
    // }
    if (idx === 0) return {
      cursor: 'pointer',
      position: 'relative',
      zIndex: 2
    }
    // return {position: 'absolute',top: 50}
    // return {transform: 'translateY(-70px)'}
    return {}
    const multiple = Math.min(idx, 2)
    return {
      ...CARD_IN_STACK,
      bottom: -ReflectionStackPerspective.Y * multiple,
      left: ReflectionStackPerspective.X * multiple,
      right: ReflectionStackPerspective.X * multiple,
      top: ReflectionStackPerspective.Y * multiple,
      zIndex: 2 - multiple
    }
  }
)

interface Props {
  meeting: ReflectionGroup_meeting
  reflectionGroup: ReflectionGroup_reflectionGroup
}

const ReflectionGroup = (props: Props) => {
  const {meeting, reflectionGroup, startIdx} = props
  const {localPhase, localStage} = meeting
  const {phaseType} = localPhase
  const {isComplete} = localStage
  const {reflections} = reflectionGroup
  const {modalPortal} = useModal()
  const [isEditingSingleCardTitle, setIsEditingSingleCardTitle] = useState(false)
  const titleInputRef = useRef(null)
  const isDraggable = phaseType === NewMeetingPhaseTypeEnum.group && !isComplete
  return (
    <>
          <Group >
            <CardStack >
              {/*<CenteredCardStack>*/}
              {reflections.map((reflection, idx) => {
                return (
                  <ReflectionWrapper key={reflection.id} idx={idx}>
                    <DraggableReflectionCard
                      idx={startIdx}
                      isDraggable={isDraggable}
                      meeting={meeting}
                      reflection={reflection}
                    />
                  </ReflectionWrapper>
                )
              })}
              {/*</CenteredCardStack>*/}
            </CardStack>
          </Group>
    </>
  )
}

export default createFragmentContainer(ReflectionGroup,
  {
    meeting: graphql`
      fragment ReflectionGroup_meeting on RetrospectiveMeeting {
        ...DraggableReflectionCard_meeting
        id
        ...ReflectionGroupHeader_meeting
        localPhase {
          phaseType
        }
        localStage {
          isComplete
        }
        isViewerDragInProgress
      }
    `,
    reflectionGroup: graphql`
      fragment ReflectionGroup_reflectionGroup on RetroReflectionGroup {
        ...ReflectionGroupHeader_reflectionGroup
        retroPhaseItemId
        id
        sortOrder
        titleIsUserDefined
        reflections {
          ...DraggableReflectionCard_reflection
          ...ReflectionCard_reflection
          id
          retroPhaseItemId
          sortOrder
        }
        isExpanded
      }
    `
  }
)
