import React, {useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {DraggableReflectionCard_reflection} from '../../__generated__/DraggableReflectionCard_reflection.graphql'
import styled from '@emotion/styled'
import ReflectionCard from '../ReflectionCard/ReflectionCard'
import {DraggableReflectionCard_meeting} from '__generated__/DraggableReflectionCard_meeting.graphql'
import {ElementWidth, ReflectionStackPerspective, Times} from '../../types/constEnums'
import {DraggableReflectionCard_staticReflections} from '__generated__/DraggableReflectionCard_staticReflections.graphql'
import useDraggableReflectionCard from '../../hooks/useDraggableReflectionCard'

const ReflectionWrapper = styled('div')<{staticIdx: number, staticReflectionCount: number, isDropping: boolean | null, readOnly: boolean}>(
  ({staticIdx, staticReflectionCount, isDropping, readOnly}): any => {
    const stackOrder = staticReflectionCount - staticIdx - 1
    const isHidden = staticIdx === -1 || isDropping
    const multiple = Math.min(stackOrder, 2)
    const scaleX = (ElementWidth.REFLECTION_CARD - ReflectionStackPerspective.X * multiple * 2) / ElementWidth.REFLECTION_CARD
    const translateY = ReflectionStackPerspective.Y * multiple
    return {
      cursor: stackOrder === 0 && !isHidden && readOnly ? 'grab' : undefined,
      position: stackOrder === 0 ? 'relative' : 'absolute',
      bottom: 0,
      left: 0,
      outline: 0,
      opacity: isHidden ? 0 : undefined,
      transform: `translateY(${translateY}px) scaleX(${scaleX})`,
      zIndex: 3 - multiple,
      transition: isHidden ? undefined : `transform ${Times.REFLECTION_DROP_DURATION}ms`
    }
  }
)

export interface DropZoneBBox {
  height: number,
  top: number,
  bottom: number
}

const DRAG_STATE = {
  id: '',
  cardOffsetX: 0,
  cardOffsetY: 0,
  clientY: 0, // used for scrollZone
  clone: null as null | HTMLDivElement,
  isDrag: false,
  ref: null as null | HTMLDivElement,
  startX: 0,
  startY: 0,
  wasDropping: false,
  targets: [] as TargetBBox[],
  prevTargetId: '',
  isBroadcasting: false,
  dropZoneEl: null as null | HTMLDivElement,
  // dropZoneId: '',
  dropZoneBBox: null as null | DropZoneBBox,
  timeout: null as null | number
}

export type ReflectionDragState = typeof DRAG_STATE

interface Props {
  isDraggable: boolean
  meeting: DraggableReflectionCard_meeting
  reflection: DraggableReflectionCard_reflection
  staticIdx: number
  staticReflections: DraggableReflectionCard_staticReflections
}

export interface TargetBBox {
  targetId: string
  top: number
  bottom: number
  left: number
  height: number
}

const DraggableReflectionCard = (props: Props) => {
  const {reflection, staticIdx, staticReflections, meeting} = props
  const {id: reflectionId, isDropping} = reflection
  const {id: meetingId, teamId} = meeting
  const dragRef = useRef({...DRAG_STATE})
  const {current: drag} = dragRef
  const staticReflectionCount = staticReflections.length
  const {onMouseDown, onClick, onBlur, readOnly, setReadOnly} = useDraggableReflectionCard(reflection, drag, staticIdx, teamId, staticReflectionCount)
  return (
    <ReflectionWrapper tabIndex={-1} onBlur={onBlur} onClick={onClick} ref={(c) => drag.ref = c} key={reflectionId}
                       staticReflectionCount={staticReflectionCount} staticIdx={staticIdx} isDropping={isDropping}
                       readOnly={readOnly}
                       onMouseDown={onMouseDown} onTouchStart={onMouseDown}>
      <ReflectionCard readOnly={readOnly} userSelect='none' reflection={reflection} showOriginFooter
                      isClipped={staticReflectionCount - 1 !== staticIdx} meetingId={meetingId}
                      setReadOnly={setReadOnly} />
    </ReflectionWrapper>
  )
}

export default createFragmentContainer(DraggableReflectionCard,
  {
    staticReflections: graphql`
      fragment DraggableReflectionCard_staticReflections on RetroReflection @relay(plural: true) {
        id
        reflectionGroupId
      }
    `,
    reflection: graphql`
      fragment DraggableReflectionCard_reflection on RetroReflection {
        ...ReflectionCard_reflection
        ...RemoteReflection_reflection
        id
        reflectionGroupId
        retroPhaseItemId
        isViewerDragging
        isDropping
        remoteDrag {
          dragUserId
          dragUserName
        }
      }
    `,
    meeting: graphql`
      fragment DraggableReflectionCard_meeting on RetrospectiveMeeting {
        id
        teamId
      }`
  }
)
