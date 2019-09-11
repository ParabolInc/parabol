import React, {useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {DraggableReflectionCard_reflection} from '../../__generated__/DraggableReflectionCard_reflection.graphql'
import ReflectionCard from '../ReflectionCard/ReflectionCard'
import {DraggableReflectionCard_meeting} from '__generated__/DraggableReflectionCard_meeting.graphql'
import {DraggableReflectionCard_staticReflections} from '__generated__/DraggableReflectionCard_staticReflections.graphql'
import useDraggableReflectionCard from '../../hooks/useDraggableReflectionCard'

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
  const {id: meetingId, teamId} = meeting
  const dragRef = useRef({...DRAG_STATE})
  const {current: drag} = dragRef
  const staticReflectionCount = staticReflections.length
  const {onMouseDown} = useDraggableReflectionCard(reflection, drag, staticIdx, teamId, staticReflectionCount)
  return (
    <div ref={(c) => drag.ref = c} onMouseDown={onMouseDown} onTouchStart={onMouseDown}>
      <ReflectionCard userSelect='none' reflection={reflection} showOriginFooter
                      isClipped={staticIdx !== 0} meetingId={meetingId} />
    </div>
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
