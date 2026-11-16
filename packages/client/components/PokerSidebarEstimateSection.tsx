import {DragDropContext, Draggable, Droppable, type DropResult} from '@hello-pangea/dnd'
import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import type {PokerSidebarEstimateSection_meeting$key} from '~/__generated__/PokerSidebarEstimateSection_meeting.graphql'
import type useGotoStageId from '~/hooks/useGotoStageId'
import useAtmosphere from '../hooks/useAtmosphere'
import useMakeStageSummaries from '../hooks/useMakeStageSummaries'
import DragEstimatingTaskMutation from '../mutations/DragEstimatingTaskMutation'
import {ESTIMATING_TASK} from '../utils/constants'
import isTempId from '../utils/relay/isTempId'
import MeetingSidebarPhaseItemChild from './MeetingSidebarPhaseItemChild'
import MeetingSubnavItem from './MeetingSubnavItem'
import PokerSidebarEstimateMeta from './PokerSidebarEstimateMeta'
import PokerSidebarStoryTitle from './PokerSidebarStoryTitle'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  meeting: PokerSidebarEstimateSection_meeting$key
}

const PokerSidebarEstimateSection = (props: Props) => {
  const {gotoStageId, handleMenuClick, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment PokerSidebarEstimateSection_meeting on PokerMeeting {
        id
        endedAt
        localStage {
          id
        }
        facilitatorStageId
        # load up the localPhase
        phases {
          ...useMakeStageSummaries_phase @alias
          ... on EstimatePhase {
            stages {
              scores {
                userId
              }
            }
          }
          phaseType
          stages {
            id
          }
        }
        localStage {
          id
        }
      }
    `,
    meetingRef
  )
  const {localStage, facilitatorStageId, id: meetingId, phases, endedAt} = meeting
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const estimatePhase = phases!.find(({phaseType}) => phaseType === 'ESTIMATE')!
  const {stages} = estimatePhase!
  const {id: localStageId} = localStage
  const stageSummaries = useMakeStageSummaries(
    estimatePhase.useMakeStageSummaries_phase,
    localStageId
  )
  const inSync = localStageId === facilitatorStageId

  const onDragEnd = (result: DropResult) => {
    const {source, destination} = result
    if (!destination) return
    const sourceTopic = stageSummaries[source.index]
    const destinationTopic = stageSummaries[destination.index]
    if (
      destination.droppableId !== ESTIMATING_TASK ||
      source.droppableId !== ESTIMATING_TASK ||
      destination.index === source.index ||
      !sourceTopic ||
      !destinationTopic
    ) {
      return
    }

    const {taskId} = sourceTopic
    const variables = {
      meetingId,
      taskId,
      newPositionIndex: destination.index
    }
    DragEstimatingTaskMutation(atmosphere, variables)
  }

  const handleClick = (stageIds: string[]) => {
    // if the facilitator is at one of the stages, go there
    if (stageIds.includes(facilitatorStageId)) {
      gotoStageId(facilitatorStageId).catch(() => {
        /*ignore*/
      })
    } else {
      // goto the first stage that the user hasn't voted on
      const summaryStages = stageIds.map((id) => stages.find((stage) => stage.id === id))
      const unvotedStage = summaryStages.find((stage) => {
        if (!stage || !stage.scores) return false
        const hasUserVoted = stage.scores.find(({userId}) => userId === viewerId)
        return !hasUserVoted
      })
      if (unvotedStage) {
        gotoStageId(unvotedStage.id)
      } else {
        // goto the last stage
        const lastStageId = stageIds[stageIds.length - 1]!
        gotoStageId(lastStageId)
      }
    }
    handleMenuClick()
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <MeetingSidebarPhaseItemChild>
        <Droppable droppableId={ESTIMATING_TASK}>
          {(provided) => {
            return (
              <div className='h-full overflow-auto pb-2' ref={provided.innerRef}>
                {stageSummaries!.map((summary, idx) => {
                  const {
                    stageIds,
                    title,
                    integratedTask,
                    isActive,
                    isNavigable,
                    finalScores,
                    taskId
                  } = summary
                  const [firstStageId] = stageIds
                  // the local user is at another stage than the facilitator stage
                  const isUnsyncedFacilitatorStage =
                    !inSync && stageIds.includes(facilitatorStageId)
                  return (
                    <Draggable
                      key={firstStageId}
                      draggableId={firstStageId}
                      index={idx}
                      isDragDisabled={!!endedAt || isTempId(taskId)}
                    >
                      {(dragProvided, dragSnapshot) => {
                        return (
                          <div
                            className={
                              dragSnapshot.isDragging
                                ? 'shadow-[var(--shadow-card-raised)]'
                                : undefined
                            }
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                          >
                            <MeetingSubnavItem
                              key={firstStageId}
                              isDragging={dragSnapshot.isDragging}
                              metaContent={<PokerSidebarEstimateMeta finalScores={finalScores} />}
                              onClick={() => handleClick(stageIds)}
                              isActive={isActive}
                              isDisabled={!isNavigable}
                              isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}
                            >
                              <Suspense
                                fallback={
                                  <>
                                    <div className='flex h-5 items-center'>
                                      <div className='h-3 w-3/4 animate-pulse rounded-sm bg-surface-well' />
                                    </div>
                                    <div className='flex h-3 items-center'>
                                      <div className='h-2 w-12 animate-pulse rounded-sm bg-surface-well' />
                                    </div>
                                  </>
                                }
                              >
                                <PokerSidebarStoryTitle
                                  title={title}
                                  integratedTask={integratedTask}
                                />
                              </Suspense>
                            </MeetingSubnavItem>
                          </div>
                        )
                      }}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </div>
            )
          }}
        </Droppable>
      </MeetingSidebarPhaseItemChild>
    </DragDropContext>
  )
}

export default PokerSidebarEstimateSection
