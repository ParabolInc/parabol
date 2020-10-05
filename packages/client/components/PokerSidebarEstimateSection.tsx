import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'
import {createFragmentContainer} from 'react-relay'
import useGotoStageId from '~/hooks/useGotoStageId'
import {PokerSidebarEstimateSection_meeting} from '~/__generated__/PokerSidebarEstimateSection_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import DragEstimatingTaskMutation from '../mutations/DragEstimatingTaskMutation'
import {navItemRaised} from '../styles/elevation'
import {SORT_STEP} from '../utils/constants'
import dndNoise from '../utils/dndNoise'
import MeetingSidebarPhaseItemChild from './MeetingSidebarPhaseItemChild'
import MeetingSubnavItem from './MeetingSubnavItem'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  meeting: PokerSidebarEstimateSection_meeting
}

const DraggableMeetingSubnavItem = styled('div')<{isDragging: boolean}>(({isDragging}) => ({
  boxShadow: isDragging ? navItemRaised : undefined
}))

const ScrollWrapper = styled('div')({
  overflow: 'auto',
  paddingBottom: 8,
  paddingRight: 8,
  height: '100%'
})

const PokerSidebarEstimateSection = (props: Props) => {
  const {gotoStageId, handleMenuClick, meeting} = props
  const {localStage, facilitatorStageId, id: meetingId, phases, endedAt} = meeting
  const atmosphere = useAtmosphere()
  const estimatePhase = phases!.find(({phaseType}) => phaseType === 'ESTIMATE')!
  const {stages} = estimatePhase!
  const {id: localStageId} = localStage
  const inSync = localStageId === facilitatorStageId

  const onDragEnd = (result) => {
    const {source, destination} = result

    if (
      !destination ||
      destination.droppableId !== 'TASK' ||
      source.droppableId !== 'TASK' ||
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
        (stages![destination.index + offset].sortOrder + destinationTopic.sortOrder) / 2 +
        dndNoise()
    }

    const {id: stageId} = sourceTopic
    const variables = {meetingId, stageId, sortOrder}
    DragEstimatingTaskMutation(atmosphere, variables)
  }

  const handleClick = (id) => {
    gotoStageId(id).catch()
    handleMenuClick()
  }
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <MeetingSidebarPhaseItemChild>
        <Droppable droppableId={'TASK'}>
          {(provided) => {
            return (
              <ScrollWrapper ref={provided.innerRef}>
                {stages!.map((stage, idx) => {
                  const {task, issue} = stage
                  const content = task?.content || issue?.summary
                  const title = content || 'Unknown story'
                  // the local user is at another stage than the facilitator stage
                  const isUnsyncedFacilitatorStage = !inSync && stage.id === facilitatorStageId
                  const estimateMeta = (
                    <div>-</div>
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
                            isDragging={dragSnapshot.isDragging}
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                          >
                            <MeetingSubnavItem
                              key={stage.id}
                              isDragging={dragSnapshot.isDragging}
                              label={title!}
                              metaContent={estimateMeta}
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
  fragment PokerSidebarEstimateSectionEstimatePhase on EstimatePhase {
    phaseType
    stages {
      id
      isComplete
      isNavigable
      ... on EstimateStageJira {
        issue {
          summary
        }
      }
      ... on EstimateStageParabol {
        task {
          content
        }
      }
      sortOrder
    }
  }
`

export default createFragmentContainer(PokerSidebarEstimateSection, {
  meeting: graphql`
    fragment PokerSidebarEstimateSection_meeting on PokerMeeting {
      id
      endedAt
      localStage {
        id
      }
      facilitatorStageId
      # load up the localPhase
      phases {
        ...PokerSidebarEstimateSectionEstimatePhase @relay(mask: false)
      }
      localStage {
        id
      }
    }
  `
})
