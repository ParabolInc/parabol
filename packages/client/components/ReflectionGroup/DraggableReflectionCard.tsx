import React, {useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {DraggableReflectionCard_reflection} from '../../__generated__/DraggableReflectionCard_reflection.graphql'
import ReflectionCard from '../ReflectionCard/ReflectionCard'
import {DraggableReflectionCard_meeting} from '../../__generated__/DraggableReflectionCard_meeting.graphql'
import {DraggableReflectionCard_staticReflections} from '../../__generated__/DraggableReflectionCard_staticReflections.graphql'
import useDraggableReflectionCard from '../../hooks/useDraggableReflectionCard'
import styled from '@emotion/styled'

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

const DragWrapper = styled('div')<{isDraggable: boolean}>(({isDraggable}) => ({
  cursor: isDraggable ? 'grab' : undefined
}))

export type ReflectionDragState = typeof DRAG_STATE

interface Props {
  isDraggable: boolean
  meeting: DraggableReflectionCard_meeting
  readOnly?: boolean
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
  const {reflection, staticIdx, staticReflections, meeting, isDraggable, readOnly} = props
  const {id: meetingId, teamId} = meeting
  const dragRef = useRef({...DRAG_STATE})
  const {current: drag} = dragRef
  const staticReflectionCount = staticReflections.length
  const {onMouseDown} = useDraggableReflectionCard(reflection, drag, staticIdx, teamId, staticReflectionCount)
  const handleDrag = isDraggable ? onMouseDown : undefined
  return (
    <DragWrapper ref={(c) => drag.ref = c} onMouseDown={handleDrag} onTouchStart={handleDrag} isDraggable={isDraggable}>
      <ReflectionCard userSelect='none' reflection={reflection}
                      isClipped={staticIdx !== 0} meetingId={meetingId} readOnly={readOnly}/>
    </DragWrapper>
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
        isEditing
        reflectionGroupId
        retroPhaseItemId
        isViewerDragging
        isViewerCreator
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
