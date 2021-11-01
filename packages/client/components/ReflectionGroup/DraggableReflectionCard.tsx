import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {createFragmentContainer, useLazyLoadQuery} from 'react-relay'
import useDraggableReflectionCard from '../../hooks/useDraggableReflectionCard'
import {DraggableReflectionCardLocalQuery} from '../../__generated__/DraggableReflectionCardLocalQuery.graphql'
import {DraggableReflectionCard_meeting} from '../../__generated__/DraggableReflectionCard_meeting.graphql'
import {DraggableReflectionCard_reflection} from '../../__generated__/DraggableReflectionCard_reflection.graphql'
import {DraggableReflectionCard_staticReflections} from '../../__generated__/DraggableReflectionCard_staticReflections.graphql'
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

const DragWrapper = styled('div')<{isDraggable: boolean | undefined}>(({isDraggable}) => ({
  cursor: isDraggable ? 'grab' : undefined
}))

export type ReflectionDragState = ReturnType<typeof makeDragState>

interface Props {
  isClipped?: boolean
  isDraggable?: boolean
  meeting: DraggableReflectionCard_meeting
  openSpotlight?: OpenSpotlight
  reflection: DraggableReflectionCard_reflection
  staticIdx?: number
  staticReflections: DraggableReflectionCard_staticReflections | null
  swipeColumn?: SwipeColumn
  dataCy?: string
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
    staticIdx = 0,
    staticReflections,
    meeting,
    openSpotlight,
    isDraggable,
    swipeColumn,
    dataCy
  } = props
  const {id: meetingId, teamId, localStage, spotlightReflection} = meeting
  const {isComplete, phaseType} = localStage
  const {isDropping, isEditing, reflectionGroupId} = reflection
  const spotlightReflectionId = spotlightReflection?.id ?? null
  const isSpotlightOpen = !!spotlightReflectionId
  const isInSpotlight = !openSpotlight
  const staticReflectionCount = staticReflections?.length || 0
  const [drag] = useState(makeDragState)
  const spotlightSearchResults = useLazyLoadQuery<DraggableReflectionCardLocalQuery>(
    graphql`
      query DraggableReflectionCardLocalQuery($reflectionId: ID!, $searchQuery: String!) {
        viewer {
          similarReflectionGroups(reflectionId: $reflectionId, searchQuery: $searchQuery) {
            id
          }
        }
      }
    `,
    // TODO: add search query
    {reflectionId: spotlightReflectionId || '', searchQuery: ''},
    {fetchPolicy: 'store-only'}
  )
  const {viewer} = spotlightSearchResults
  const {similarReflectionGroups} = viewer
  const reflectionGroupIdsInSpotlight = similarReflectionGroups
    ? similarReflectionGroups.map((group) => group.id)
    : []
  const isReflectionGroupIdInSpotlight = reflectionGroupIdsInSpotlight.includes(reflectionGroupId)
  const {onMouseDown} = useDraggableReflectionCard(
    reflection,
    drag,
    staticIdx,
    meetingId,
    teamId,
    staticReflectionCount,
    swipeColumn
  )
  const isDragPhase = phaseType === 'group' && !isComplete
  const canDrag = isDraggable && isDragPhase && !isEditing && !isDropping
  // slow state updates can mean we miss an onMouseDown event, so use isDragPhase instead of canDrag
  const handleDrag = isDragPhase ? onMouseDown : undefined
  return (
    <DragWrapper
      ref={(c) => {
        // if the spotlight is closed, this card is the single source of truth
        // Else, if it is not in the spotlight search results
        // Else, if this is the instance in the search results
        const isPriorityCard = !isSpotlightOpen || !isReflectionGroupIdInSpotlight || isInSpotlight
        if (isPriorityCard) {
          drag.ref = c
        }
      }}
      onMouseDown={handleDrag}
      onTouchStart={handleDrag}
      isDraggable={canDrag}
    >
      <ReflectionCard
        dataCy={dataCy}
        reflection={reflection}
        isClipped={isClipped}
        meeting={meeting}
        openSpotlight={openSpotlight}
      />
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
      promptId
      isViewerDragging
      isViewerCreator
      isDropping
      reflectionGroupId
      remoteDrag {
        dragUserId
        dragUserName
        targetId
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
      spotlightReflection {
        id
      }
    }
  `
})
