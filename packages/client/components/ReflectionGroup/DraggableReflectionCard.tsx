import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo, useState} from 'react'
import {useFragment} from 'react-relay'
import useSpotlightResults from '~/hooks/useSpotlightResults'
import useDraggableReflectionCard from '../../hooks/useDraggableReflectionCard'
import {DraggableReflectionCard_meeting$key} from '../../__generated__/DraggableReflectionCard_meeting.graphql'
import {DraggableReflectionCard_reflection$key} from '../../__generated__/DraggableReflectionCard_reflection.graphql'
import {DraggableReflectionCard_staticReflections$key} from '../../__generated__/DraggableReflectionCard_staticReflections.graphql'
import {SwipeColumn} from '../GroupingKanban'
import {OpenSpotlight} from '../GroupingKanbanColumn'
import ReflectionCard from '../ReflectionCard/ReflectionCard'

export interface DropZoneBBox {
  height: number
  top: number
  bottom: number
  width: number
}

const makeDragState = () => ({
  id: '',
  cardOffsetX: 0,
  cardOffsetY: 0,
  clientY: 0, // used for scrollZone
  clone: null as null | HTMLDivElement,
  isDrag: false,
  longpressed: null as null | boolean,
  longpressTimeout: undefined as undefined | number,
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
})

const DragWrapper = styled('div')<{showDragCursor: boolean | undefined}>(({showDragCursor}) => ({
  cursor: showDragCursor ? 'grab' : undefined
}))

export type ReflectionDragState = ReturnType<typeof makeDragState>

interface Props {
  isClipped?: boolean
  isDraggable?: boolean
  meeting: DraggableReflectionCard_meeting$key
  openSpotlight?: OpenSpotlight
  reflection: DraggableReflectionCard_reflection$key
  staticIdx?: number
  staticReflections: DraggableReflectionCard_staticReflections$key | null
  swipeColumn?: SwipeColumn
  dataCy?: string
  isSpotlightEntering?: boolean
  showDragHintAnimation?: boolean
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
    reflection: reflectionRef,
    staticIdx = 0,
    staticReflections: staticReflectionsRef,
    meeting: meetingRef,
    openSpotlight,
    isDraggable,
    swipeColumn,
    dataCy,
    isSpotlightEntering,
    showDragHintAnimation
  } = props
  const staticReflections = useFragment(
    graphql`
      fragment DraggableReflectionCard_staticReflections on RetroReflection @relay(plural: true) {
        id
        reflectionGroupId
      }
    `,
    staticReflectionsRef
  )
  const reflection = useFragment(
    graphql`
      fragment DraggableReflectionCard_reflection on RetroReflection {
        ...ReflectionCard_reflection
        ...RemoteReflection_reflection
        id
        isEditing
        promptId
        isViewerDragging
        isViewerCreator
        isDropping
        reflectionGroupId
        remoteDrag {
          dragUserId
          dragUserName
          isSpotlight
          targetId
        }
      }
    `,
    reflectionRef
  )
  const meeting = useFragment(
    graphql`
      fragment DraggableReflectionCard_meeting on RetrospectiveMeeting {
        ...ReflectionCard_meeting
        ...RemoteReflection_meeting
        ...useSpotlightResults_meeting
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
        spotlightGroup {
          id
        }
        spotlightReflectionId
        spotlightSearchQuery
      }
    `,
    meetingRef
  )
  const {teamId, localStage, spotlightGroup, spotlightReflectionId} = meeting
  const {isComplete, phaseType} = localStage
  const {id: reflectionId, isDropping, isEditing, remoteDrag} = reflection
  const spotlightGroupId = spotlightGroup?.id
  const isSpotlightOpen = !!spotlightGroupId
  const isInSpotlight = !openSpotlight
  const staticReflectionCount = staticReflections?.length || 0
  const [drag] = useState(makeDragState)
  const spotlightResultGroups = useSpotlightResults(meeting)
  const isReflectionIdInSpotlight = useMemo(() => {
    return (
      reflectionId === spotlightReflectionId ||
      !!(
        reflectionId &&
        spotlightResultGroups?.find(({reflections}) =>
          reflections?.find(({id}) => id === reflectionId)
        )
      )
    )
  }, [spotlightResultGroups, reflectionId, spotlightReflectionId])
  const {onMouseDown} = useDraggableReflectionCard(
    meeting,
    reflection,
    drag,
    staticIdx,
    teamId,
    staticReflectionCount,
    swipeColumn
  )
  const canHandleDrag = phaseType === 'group' && !isComplete && isDraggable
  const showDragCursor = isDraggable && canHandleDrag && !isEditing && !isDropping
  // slow state updates can mean we miss an onMouseDown event
  const handleDrag = canHandleDrag ? onMouseDown : undefined

  return (
    <DragWrapper
      ref={(c) => {
        // If the spotlight is closed, this card is the single source of truth
        // Else, if it's a remote drag that is not in the spotlight
        // Else, if this is the instance in the source or search results
        // And Spotlight modal isn't entering. This throws off dropping remote card position
        const isPriorityCard =
          (!isSpotlightOpen || (!isReflectionIdInSpotlight && remoteDrag) || isInSpotlight) &&
          !isSpotlightEntering
        if (isPriorityCard) {
          drag.ref = c
        }
      }}
      onMouseDown={handleDrag}
      onTouchStart={handleDrag}
      showDragCursor={showDragCursor}
    >
      <ReflectionCard
        dataCy={dataCy}
        reflectionRef={reflection}
        isClipped={isClipped}
        meetingRef={meeting}
        openSpotlight={openSpotlight}
        showDragHintAnimation={showDragHintAnimation}
      />
    </DragWrapper>
  )
}

export default DraggableReflectionCard
