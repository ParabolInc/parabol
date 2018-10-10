import {RetroSidebarDiscussSection_viewer} from '__generated__/RetroSidebarDiscussSection_viewer.graphql'
import React from 'react'
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'
import styled from 'react-emotion'
import {commitLocalUpdate, createFragmentContainer, graphql} from 'react-relay'
import LabelHeading from 'universal/components/LabelHeading/LabelHeading'
import MeetingSidebarLabelBlock from 'universal/components/MeetingSidebarLabelBlock'
import MeetingSubnavItem from 'universal/components/MeetingSubnavItem'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import DragDiscussionTopicMutation from 'universal/mutations/DragDiscussionTopicMutation'
import {navItemRaised} from 'universal/styles/elevation'
import {meetingVoteIcon} from 'universal/styles/meeting'
import ui from 'universal/styles/ui'
import {
  DISCUSSION_TOPIC,
  RETRO_TOPIC_LABEL,
  RETRO_VOTED_LABEL,
  SORT_STEP
} from 'universal/utils/constants'
import dndNoise from 'universal/utils/dndNoise'
import sidebarCanAutoCollapse from 'universal/utils/meetings/sidebarCanAutoCollapse'
import plural from 'universal/utils/plural'
import Icon from 'universal/components/Icon'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'

interface Props extends WithAtmosphereProps {
  gotoStageId: (stageId: string) => void
  viewer: RetroSidebarDiscussSection_viewer
}

const SidebarPhaseItemChild = styled('div')({
  display: 'flex',
  flexDirection: 'column'
})

const VoteTally = styled('div')(
  ({isUnsyncedFacilitatorStage}: {isUnsyncedFacilitatorStage: boolean | null}) => ({
    color: isUnsyncedFacilitatorStage ? ui.palette.warm : ui.palette.midGray,
    fontSize: ui.iconSize,
    fontWeight: 600,
    lineHeight: ui.navTopicLineHeight,
    marginRight: '0.5rem'
  })
)

const VoteIcon = styled(Icon)({
  color: 'inherit',
  fontSize: MD_ICONS_SIZE_18,
  marginRight: '.125rem'
})

const DraggableMeetingSubnavItem = styled('div')(({isDragging}: {isDragging: boolean}) => ({
  boxShadow: isDragging && navItemRaised
}))

const RetroSidebarDiscussSection = (props: Props) => {
  const {
    atmosphere,
    gotoStageId,
    viewer: {
      team: {newMeeting}
    }
  } = props
  if (!newMeeting) return null
  const {localPhase, localStage, facilitatorStageId, meetingId} = newMeeting
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

  const toggleSidebar = () => {
    const {
      atmosphere,
      viewer: {
        team: {teamId, isMeetingSidebarCollapsed}
      }
    } = props
    commitLocalUpdate(atmosphere, (store) => {
      const team = store.get(teamId)
      if (!team) return
      team.setValue(!isMeetingSidebarCollapsed, 'isMeetingSidebarCollapsed')
    })
  }

  const handleClick = (id) => {
    gotoStageId(id)
    if (sidebarCanAutoCollapse()) toggleSidebar()
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
          {(provided) => {
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
                            innerRef={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                          >
                            <MeetingSubnavItem
                              key={stage.id}
                              isDragging={dragSnapshot.isDragging}
                              label={title}
                              metaContent={voteMeta}
                              onClick={() => handleClick(stage.id)}
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
        isMeetingSidebarCollapsed
        teamId: id
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
