import {RetroSidebarDiscussSection_viewer} from '../__generated__/RetroSidebarDiscussSection_viewer.graphql'
import React from 'react'
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import MeetingSubnavItem from './MeetingSubnavItem'
import withAtmosphere, {
  WithAtmosphereProps
} from '../decorators/withAtmosphere/withAtmosphere'
import {useGotoStageId} from '../hooks/useMeeting'
import DragDiscussionTopicMutation from '../mutations/DragDiscussionTopicMutation'
import {navItemRaised} from '../styles/elevation'
import {meetingVoteIcon} from '../styles/meeting'
import {
  DISCUSSION_TOPIC,
  SORT_STEP
} from '../utils/constants'
import dndNoise from '../utils/dndNoise'
import Icon from './Icon'
import MeetingSidebarPhaseItemChild from './MeetingSidebarPhaseItemChild'
import {NavSidebar} from '../types/constEnums'
import {ICON_SIZE} from '../styles/typographyV2'
import {PALETTE} from '../styles/paletteV2'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'

const lineHeight = NavSidebar.SUB_LINE_HEIGHT

interface Props extends WithAtmosphereProps {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  viewer: RetroSidebarDiscussSection_viewer
}

const VoteTally = styled('div')<{isUnsyncedFacilitatorStage: boolean | null}>(
  ({isUnsyncedFacilitatorStage}) => ({
    alignItems: 'center',
    color: isUnsyncedFacilitatorStage ? PALETTE.EMPHASIS_WARM : PALETTE.TEXT_GRAY,
    display: 'flex',
    fontSize: NavSidebar.SUB_FONT_SIZE,
    fontWeight: 600,
    height: lineHeight,
    lineHeight,
    marginRight: 8
  })
)

const VoteIcon = styled(Icon)({
  color: 'inherit',
  fontSize: ICON_SIZE.MD18,
  height: lineHeight,
  lineHeight,
  marginRight: 2
})

const DraggableMeetingSubnavItem = styled('div')<{isDragging: boolean}>(({isDragging}) => ({
  boxShadow: isDragging ? navItemRaised : undefined
}))

const ScrollWrapper = styled('div')({
  overflow: 'auto',
  height: '100%'
})

const RetroSidebarDiscussSection = (props: Props) => {
  const {
    atmosphere,
    gotoStageId,
    handleMenuClick,
    viewer: {team}
  } = props
  const {newMeeting} = team!
  if (!newMeeting) return null
  const {localStage, facilitatorStageId, id: meetingId, phases} = newMeeting
  const discussPhase = phases!.find(({phaseType}) => phaseType === NewMeetingPhaseTypeEnum.discuss)!
  // assert that the discuss phase and its stages are non-null
  // since we render this component when the vote phase is complete
  // see: RetroSidebarPhaseListItemChildren.tsx
  const {stages} = discussPhase!
  const {id: localStageId} = localStage
  const inSync = localStageId === facilitatorStageId

  const onDragEnd = (result) => {
    const {source, destination} = result

    if (
      !destination ||
      destination.droppableId !== DISCUSSION_TOPIC ||
      source.droppableId !== DISCUSSION_TOPIC ||
      destination.index === source.index
    ) {
      return
    }

    const sourceTopic = stages![source.index]
    const destinationTopic = stages![destination.index]

    let sortOrder
    if (destination.index === 0) {
      sortOrder = destinationTopic.sortOrder - SORT_STEP + dndNoise()
    } else if (destination.index === stages!.length - 1) {
      sortOrder = destinationTopic.sortOrder + SORT_STEP + dndNoise()
    } else {
      const offset = source.index > destination.index ? -1 : 1
      sortOrder =
        (stages![destination.index + offset].sortOrder + destinationTopic.sortOrder) / 2 + dndNoise()
    }

    const {id: stageId} = sourceTopic
    const variables = {meetingId, stageId, sortOrder}
    DragDiscussionTopicMutation(atmosphere, variables)
  }

  const handleClick = (id) => {
    gotoStageId(id).catch()
    handleMenuClick()
  }
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <MeetingSidebarPhaseItemChild>
        <Droppable droppableId={DISCUSSION_TOPIC}>
          {(provided) => {
            return (
              <ScrollWrapper ref={provided.innerRef}>
                {stages!.map((stage, idx) => {
                  const {reflectionGroup} = stage
                  if (!reflectionGroup) return null
                  const {title, voteCount} = reflectionGroup
                  // the local user is at another stage than the facilitator stage
                  const isUnsyncedFacilitatorStage = !inSync && stage.id === facilitatorStageId
                  const voteMeta = (
                    <VoteTally isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}>
                      <VoteIcon>{meetingVoteIcon}</VoteIcon>
                      {voteCount}
                    </VoteTally>
                  )
                  return (
                    <Draggable key={stage.id} draggableId={stage.id} index={idx}>
                      {(dragProvided, dragSnapshot) => {
                        return (
                          <DraggableMeetingSubnavItem
                            isDragging={dragSnapshot.isDragging}
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                          >
                            <MeetingSubnavItem
                              key={stage.id}
                              isDragging={dragSnapshot.isDragging}
                              label={title!}
                              metaContent={voteMeta}
                              onClick={() => handleClick(stage.id)}
                              isActive={localStage.id === stage.id}
                              isComplete={stage.isComplete}
                              isDisabled={!stage.isNavigable}
                              isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}
                            />
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

export default createFragmentContainer(withAtmosphere(RetroSidebarDiscussSection), {
  viewer: graphql`
    fragment RetroSidebarDiscussSection_viewer on User {
      team(teamId: $teamId) {
        isMeetingSidebarCollapsed
        id
        newMeeting {
          id
          localStage {
            id
          }
          ... on RetrospectiveMeeting {
            facilitatorStageId
            # load up the localPhase
            phases {
              ...RetroSidebarDiscussSectionDiscussPhase @relay(mask: false)
            }
            localStage {
              id
            }
          }
        }
      }
    }
  `
})
