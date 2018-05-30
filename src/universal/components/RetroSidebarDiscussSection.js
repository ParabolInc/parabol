// @flow
import React from 'react'
import styled from 'react-emotion'
import type {RetroSidebarDiscussSection_viewer as Viewer} from './__generated__/RetroSidebarDiscussSection_viewer.graphql'
import {createFragmentContainer} from 'react-relay'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import ui from 'universal/styles/ui'
import MeetingSidebarLabelBlock from 'universal/components/MeetingSidebarLabelBlock'
import MeetingSubnavItem from 'universal/components/MeetingSubnavItem'
import {
  RETRO_TOPIC_LABEL,
  RETRO_VOTED_LABEL,
  DISCUSSION_TOPIC,
  SORT_STEP
} from 'universal/utils/constants'
import plural from 'universal/utils/plural'
import LabelHeading from 'universal/components/LabelHeading/LabelHeading'
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd'
import dndNoise from 'universal/utils/dndNoise'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import DragDiscussionTopicMutation from 'universal/mutations/DragDiscussionTopicMutation'

type Props = {|
  gotoStageId: (stageId: string) => void,
  viewer: Viewer
|}

const SidebarPhaseItemChild = styled('div')({
  display: 'flex',
  flexDirection: 'column'
})

const VoteTally = styled('div')({
  lineHeight: ui.navTopicLineHeight,
  marginRight: '0.5rem'
})

const CheckIcon = styled(StyledFontAwesome)(({isUnsyncedFacilitatorStage}) => ({
  color: isUnsyncedFacilitatorStage ? ui.palette.warm : ui.palette.mid
}))

const DraggableMeetingSubnavItem = styled('div')(({isDragging}) => ({
  boxShadow: isDragging && ui.shadow[2]
}))

const RetroSidebarDiscussSection = (props: Props) => {
  const {
    atmosphere,
    gotoStageId,
    viewer: {
      team: {newMeeting}
    }
  } = props
  const {localPhase, localStage, facilitatorStageId, meetingId} = newMeeting || {}
  if (!localPhase || !localPhase.stages || !localStage) return null
  const {stages} = localPhase
  const {localStageId} = localStage
  const inSync = localStageId === facilitatorStageId

  const onDragEnd = (result) => {
    const {source, destination} = result

    if (
      !destination ||
      destination.droppableId !== DISCUSSION_TOPIC ||
      source.droppableId !== DISCUSSION_TOPIC
    ) {
      return
    }

    const sourceTopic = stages[source.index]
    const destinationTopic = stages[destination.index]

    let sortOrder
    if (destination.index === 0) {
      sortOrder = destinationTopic.sortOrder - SORT_STEP + dndNoise()
    } else if (destination.index === stages.length - 1) {
      sortOrder = destinationTopic.sortOrder + SORT_STEP + dndNoise()
    } else {
      sortOrder =
        (stages[destination.index - 1].sortOrder + destinationTopic.sortOrder) / 2 + dndNoise()
    }

    const {id: stageId} = sourceTopic
    const variables = {meetingId, stageId, sortOrder}
    DragDiscussionTopicMutation(atmosphere, variables)
  }
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <SidebarPhaseItemChild>
        <MeetingSidebarLabelBlock>
          <LabelHeading>
            {plural(stages.length, `${RETRO_VOTED_LABEL} ${RETRO_TOPIC_LABEL}`)}
          </LabelHeading>
        </MeetingSidebarLabelBlock>
        <Droppable droppableId={DISCUSSION_TOPIC}>
          {(provided, snapshot) => {
            return (
              <div ref={provided.innerRef}>
                {stages.map((stage, idx) => {
                  const {reflectionGroup, sortOrder} = stage
                  if (!reflectionGroup) return null
                  const {title, voteCount} = reflectionGroup
                  // the local user is at another stage than the facilitator stage
                  const isUnsyncedFacilitatorStage = !inSync && stage.id === facilitatorStageId
                  const navState = {
                    isActive: localStage.localStageId === stage.id, // the local user is at this stage
                    isComplete: stage.isComplete, // this stage is complete
                    isDisabled: !stage.isNavigable,
                    isUnsyncedFacilitatorStage
                  }
                  const voteMeta = (
                    <VoteTally>
                      <CheckIcon
                        isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}
                        name='check'
                      />
                      {' x '}
                      {voteCount}
                    </VoteTally>
                  )
                  return (
                    <Draggable key={stage.id} draggableId={stage.id} index={idx}>
                      {(dragProvided, dragSnapshot) => {
                        return (
                          <DraggableMeetingSubnavItem
                            isDragging={dragSnapshot.isDragging}
                            innerRef={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                          >
                            <MeetingSubnavItem
                              key={stage.id}
                              isDragging={dragSnapshot.isDragging}
                              label={title}
                              metaContent={voteMeta}
                              onClick={() => gotoStageId(stage.id)}
                              orderLabel={`${idx + 1}.`}
                              sortOrder={sortOrder}
                              {...navState}
                            />
                          </DraggableMeetingSubnavItem>
                        )
                      }}
                    </Draggable>
                  )
                })}
              </div>
            )
          }}
        </Droppable>
      </SidebarPhaseItemChild>
    </DragDropContext>
  )
}

export default createFragmentContainer(
  withAtmosphere(RetroSidebarDiscussSection),
  graphql`
    fragment RetroSidebarDiscussSection_viewer on User {
      team(teamId: $teamId) {
        newMeeting {
          meetingId: id
          localStage {
            localStageId: id
          }
          ... on RetrospectiveMeeting {
            facilitatorStageId
            # load up the localPhase
            phases {
              ... on DiscussPhase {
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
            }
            localPhase {
              ... on DiscussPhase {
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
            }
          }
        }
      }
    }
  `
)
