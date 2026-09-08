import {DragDropContext, Draggable, Droppable, type DropResult} from '@hello-pangea/dnd'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamHealthSidebarResultSection_meeting$key} from '~/__generated__/TeamHealthSidebarResultSection_meeting.graphql'
import type useGotoStageId from '~/hooks/useGotoStageId'
import useDragTeamHealthResultStageMutation from '../../mutations/useDragTeamHealthResultStageMutation'
import {cn} from '../../ui/cn'
import {SORT_STEP} from '../../utils/constants'
import dndNoise from '../../utils/dndNoise'
import {
  getOrderedTeamHealthCategories,
  getTeamHealthCategoryDotColor
} from '../ActivityLibrary/TeamHealth/getTeamHealthCategoryColor'
import MeetingSidebarPhaseItemChild from '../MeetingSidebarPhaseItemChild'
import MeetingSubnavItem from '../MeetingSubnavItem'
import TeamHealthScoreDelta from './TeamHealthScoreDelta'

// navItemRaised (Elevation.Z8)
const navItemRaisedShadowCls =
  'shadow-[0px_5px_5px_-3px_rgba(0,0,0,.2),0px_8px_10px_1px_rgba(0,0,0,.14),0px_3px_14px_2px_rgba(0,0,0,.12)]'

const TEAM_HEALTH_RESULT_DROPPABLE = 'teamHealthResult'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  meeting: TeamHealthSidebarResultSection_meeting$key
}

const TeamHealthSidebarResultSection = (props: Props) => {
  const {gotoStageId, handleMenuClick, meeting: meetingRef} = props
  const [dragTeamHealthResultStage] = useDragTeamHealthResultStageMutation()
  const meeting = useFragment(
    graphql`
      fragment TeamHealthSidebarResultSection_meeting on TeamHealthMeeting {
        id
        localStage {
          id
        }
        template {
          availableQuestionPacks {
            questions {
              category {
                id
                name
                createdAt
              }
            }
          }
        }
        phases {
          phaseType
          stages {
            id
            isNavigable
            ... on TeamHealthResultStage {
              sortOrder
              score
              previousScore
              # aliased for the same reason as TeamHealthResponseCard: NewMeetingStage.question is
              # a String on the embedded TeamHealthStage, so the raw key would conflict
              healthQuestion: question {
                category {
                  id
                  name
                }
              }
            }
          }
        }
      }
    `,
    meetingRef
  )
  const {id: meetingId, localStage, phases, template} = meeting
  const orderedCategoryIds = getOrderedTeamHealthCategories(
    template?.availableQuestionPacks ?? []
  ).map((category) => category.id)
  const stages = phases.find((phase) => phase.phaseType === 'TEAM_HEALTH_RESULT')?.stages ?? []
  const handleClick = (stageId: string) => {
    gotoStageId(stageId).catch(() => {
      /*ignore*/
    })
    handleMenuClick()
  }
  const onDragEnd = (result: DropResult) => {
    const {source, destination} = result
    if (!destination || destination.index === source.index) return
    const sourceStage = stages[source.index]
    const destinationStage = stages[destination.index]
    if (!sourceStage || destinationStage?.sortOrder == null) return
    const {sortOrder: destinationSortOrder} = destinationStage
    let sortOrder: number
    if (destination.index === 0) {
      sortOrder = destinationSortOrder - SORT_STEP + dndNoise()
    } else if (destination.index === stages.length - 1) {
      sortOrder = destinationSortOrder + SORT_STEP + dndNoise()
    } else {
      const offset = source.index > destination.index ? -1 : 1
      const neighborSortOrder = stages[destination.index + offset]!.sortOrder!
      sortOrder = (neighborSortOrder + destinationSortOrder) / 2 + dndNoise()
    }
    dragTeamHealthResultStage({variables: {meetingId, stageId: sourceStage.id, sortOrder}})
  }
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <MeetingSidebarPhaseItemChild>
        <Droppable droppableId={TEAM_HEALTH_RESULT_DROPPABLE}>
          {(provided) => (
            <div className='overflow-auto pb-2' ref={provided.innerRef}>
              {stages.map((stage, idx) => {
                const {id: stageId, isNavigable, score, previousScore, healthQuestion} = stage
                const category = healthQuestion?.category
                return (
                  <Draggable key={stageId} draggableId={stageId} index={idx}>
                    {(dragProvided, dragSnapshot) => (
                      <div
                        className={cn(dragSnapshot.isDragging && navItemRaisedShadowCls)}
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                      >
                        <MeetingSubnavItem
                          isActive={localStage?.id === stageId}
                          isDisabled={!isNavigable}
                          isDragging={dragSnapshot.isDragging}
                          isUnsyncedFacilitatorStage={false}
                          metaContent={
                            <TeamHealthScoreDelta score={score} previousScore={previousScore} />
                          }
                          onClick={() => handleClick(stageId)}
                        >
                          <div className='flex items-center gap-2'>
                            {category && (
                              <span
                                className={cn(
                                  'size-2 shrink-0 rounded-full',
                                  getTeamHealthCategoryDotColor(category.id, orderedCategoryIds)
                                )}
                              />
                            )}
                            {category?.name ?? ''}
                          </div>
                        </MeetingSubnavItem>
                      </div>
                    )}
                  </Draggable>
                )
              })}
              {provided.placeholder}
              <div className='px-4 pt-1 text-fg-muted text-xs'>
                Ordered by the steepest drop since the last cycle. Drag to reorder
              </div>
            </div>
          )}
        </Droppable>
      </MeetingSidebarPhaseItemChild>
    </DragDropContext>
  )
}

export default TeamHealthSidebarResultSection
