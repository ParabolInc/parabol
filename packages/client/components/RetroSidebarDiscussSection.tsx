import styled from '@emotion/styled'
import {ThumbUp} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {DragDropContext, Draggable, Droppable, DropResult} from 'react-beautiful-dnd'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useGotoStageId from '~/hooks/useGotoStageId'
import {DeepNonNullable} from '~/types/generics'
import {
  RetroSidebarDiscussSection_meeting$key,
  RetroSidebarDiscussSection_meeting
} from '~/__generated__/RetroSidebarDiscussSection_meeting.graphql'
import DragDiscussionTopicMutation from '../mutations/DragDiscussionTopicMutation'
import {navItemRaised} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {NavSidebar} from '../types/constEnums'
import {DISCUSSION_TOPIC, SORT_STEP} from '../utils/constants'
import dndNoise from '../utils/dndNoise'
import MeetingSidebarPhaseItemChild from './MeetingSidebarPhaseItemChild'
import MeetingSubnavItem from './MeetingSubnavItem'

const lineHeight = NavSidebar.SUB_LINE_HEIGHT

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  meeting: RetroSidebarDiscussSection_meeting$key
}

const VoteTally = styled('div')<{isUnsyncedFacilitatorStage: boolean | null}>(
  ({isUnsyncedFacilitatorStage}) => ({
    alignItems: 'center',
    color: isUnsyncedFacilitatorStage ? PALETTE.ROSE_500 : PALETTE.SLATE_600,
    display: 'flex',
    fontSize: NavSidebar.SUB_FONT_SIZE,
    fontWeight: 600,
    height: lineHeight,
    lineHeight,
    marginRight: 8
  })
)

const VoteIcon = styled(ThumbUp)({
  color: 'inherit',
  height: 18,
  width: 18,
  marginRight: 2
})

const DraggableMeetingSubnavItem = styled('div')<{isDragging: boolean}>(({isDragging}) => ({
  boxShadow: isDragging ? navItemRaised : undefined
}))

const ScrollWrapper = styled('div')({
  overflow: 'auto',
  paddingBottom: 8,
  paddingRight: 8,
  height: '100%'
})

type NonNullPhase = DeepNonNullable<RetroSidebarDiscussSection_meeting['phases'][0]>

const RetroSidebarDiscussSection = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {gotoStageId, handleMenuClick, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroSidebarDiscussSection_meeting on RetrospectiveMeeting {
        id
        endedAt
        localStage {
          id
        }
        facilitatorStageId
        # load up the localPhase
        phases {
          ...RetroSidebarDiscussSectionDiscussPhase @relay(mask: false)
        }
        localStage {
          id
        }
      }
    `,
    meetingRef
  )
  const {localStage, facilitatorStageId, id: meetingId, phases, endedAt} = meeting
  const discussPhase = phases.find(({phaseType}) => phaseType === 'discuss')
  // assert that the discuss phase and its stages are non-null
  // since we render this component when the vote phase is complete
  // see: RetroSidebarPhaseListItemChildren.tsx
  const {stages} = discussPhase as NonNullPhase
  const {id: localStageId} = localStage
  const inSync = localStageId === facilitatorStageId

  const onDragEnd = (result: DropResult) => {
    const {source, destination} = result
    if (!destination) return
    const sourceTopic = stages[source.index]
    const destinationTopic = stages[destination.index]
    if (
      destination.droppableId !== DISCUSSION_TOPIC ||
      source.droppableId !== DISCUSSION_TOPIC ||
      destination.index === source.index ||
      !sourceTopic ||
      !destinationTopic
    ) {
      return
    }

    let sortOrder
    if (destination.index === 0) {
      sortOrder = destinationTopic.sortOrder - SORT_STEP + dndNoise()
    } else if (destination.index === stages.length - 1) {
      sortOrder = destinationTopic.sortOrder + SORT_STEP + dndNoise()
    } else {
      const offset = source.index > destination.index ? -1 : 1
      sortOrder =
        (stages[destination.index + offset]!.sortOrder + destinationTopic.sortOrder) / 2 +
        dndNoise()
    }

    const {id: stageId} = sourceTopic
    const variables = {meetingId, stageId, sortOrder}
    DragDiscussionTopicMutation(atmosphere, variables)
  }

  const handleClick = (id: string) => {
    gotoStageId(id).catch()
    handleMenuClick()
  }
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <MeetingSidebarPhaseItemChild>
        <Droppable droppableId={DISCUSSION_TOPIC}>
          {(provided) => {
            return (
              <ScrollWrapper data-cy='discussion-section' ref={provided.innerRef}>
                {stages.map((stage, idx) => {
                  const {reflectionGroup} = stage
                  if (!reflectionGroup) return null
                  const {title, voteCount} = reflectionGroup
                  // the local user is at another stage than the facilitator stage
                  const isUnsyncedFacilitatorStage = !inSync && stage.id === facilitatorStageId
                  const voteMeta = (
                    <VoteTally isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}>
                      <VoteIcon />
                      {voteCount || 0}
                    </VoteTally>
                  )
                  return (
                    <Draggable
                      key={stage.id}
                      draggableId={stage.id}
                      index={idx}
                      isDragDisabled={!!endedAt}
                    >
                      {(dragProvided, dragSnapshot) => {
                        return (
                          <DraggableMeetingSubnavItem
                            data-cy={`discuss-item-${idx}`}
                            isDragging={dragSnapshot.isDragging}
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                          >
                            <MeetingSubnavItem
                              key={stage.id}
                              isDragging={dragSnapshot.isDragging}
                              metaContent={voteMeta}
                              onClick={() => handleClick(stage.id)}
                              isActive={localStage.id === stage.id}
                              isComplete={stage.isComplete}
                              isDisabled={!stage.isNavigable}
                              isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}
                            >
                              {title!}
                            </MeetingSubnavItem>
                          </DraggableMeetingSubnavItem>
                        )
                      }}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </ScrollWrapper>
            )
          }}
        </Droppable>
      </MeetingSidebarPhaseItemChild>
    </DragDropContext>
  )
}

graphql`
  fragment RetroSidebarDiscussSectionDiscussPhase on DiscussPhase {
    phaseType
    stages {
      id
      isComplete
      isNavigable
      reflectionGroup {
        title
        voteCount
      }
      sortOrder
    }
  }
`

export default RetroSidebarDiscussSection
