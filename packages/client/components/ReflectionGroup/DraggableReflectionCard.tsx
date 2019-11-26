import React, {useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {DraggableReflectionCard_reflection} from '../../__generated__/DraggableReflectionCard_reflection.graphql'
import ReflectionCard from '../ReflectionCard/ReflectionCard'
import {DraggableReflectionCard_meeting} from '../../__generated__/DraggableReflectionCard_meeting.graphql'
import {DraggableReflectionCard_staticReflections} from '../../__generated__/DraggableReflectionCard_staticReflections.graphql'
import useDraggableReflectionCard from '../../hooks/useDraggableReflectionCard'
import styled from '@emotion/styled'
import {SwipeColumn} from '../GroupingKanban'
import {NewMeetingPhaseTypeEnum} from '../../types/graphql'

export interface DropZoneBBox {
  height: number
  top: number
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

const DragWrapper = styled('div')<{isDraggable: boolean | undefined}>(({isDraggable}) => ({
  cursor: isDraggable ? 'grab' : undefined
}))

export type ReflectionDragState = typeof DRAG_STATE

interface Props {
  isClipped?: boolean
  isDraggable?: boolean
  meeting: DraggableReflectionCard_meeting
  reflection: DraggableReflectionCard_reflection
  staticIdx: number
  staticReflections: DraggableReflectionCard_staticReflections
  swipeColumn?: SwipeColumn
}

export interface TargetBBox {
  targetId: string
  top: number
  bottom: number
  left: number
  height: number
}

const DraggableReflectionCard = (props: Props) => {
  const {
    isClipped,
    reflection,
    staticIdx,
    staticReflections,
    meeting,
    isDraggable,
    swipeColumn
  } = props
  const {id: meetingId, teamId, localStage} = meeting
  const {isComplete, phaseType} = localStage
  const {isDropping, isEditing} = reflection
  const dragRef = useRef({...DRAG_STATE})
  const {current: drag} = dragRef
  const staticReflectionCount = staticReflections.length
  const {onMouseDown} = useDraggableReflectionCard(
    reflection,
    drag,
    staticIdx,
    meetingId,
    teamId,
    staticReflectionCount,
    swipeColumn
  )
  const isDragPhase = phaseType === NewMeetingPhaseTypeEnum.group && !isComplete
  const canDrag = isDraggable && isDragPhase && !isEditing && !isDropping
  const handleDrag = canDrag ? onMouseDown : undefined
  return (
    <DragWrapper
      ref={(c) => (drag.ref = c)}
      onMouseDown={handleDrag}
      onTouchStart={handleDrag}
      isDraggable={canDrag}
    >
      <ReflectionCard reflection={reflection} isClipped={isClipped} meeting={meeting} />
    </DragWrapper>
  )
}

export default createFragmentContainer(DraggableReflectionCard, {
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
      ...ReflectionCard_meeting
      id
      teamId
      localStage {
        isComplete
        phaseType
      }
      phases {
        stages {
          isComplete
          phaseType
        }
      }
    }
  `
})
