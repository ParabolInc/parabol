import {DragDropContext, Draggable, Droppable, type DropResult} from '@hello-pangea/dnd'
import {ThumbUp} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {
  RetroSidebarDiscussSection_meeting$data,
  RetroSidebarDiscussSection_meeting$key
} from '~/__generated__/RetroSidebarDiscussSection_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import type useGotoStageId from '~/hooks/useGotoStageId'
import type {DeepNonNullable} from '~/types/generics'
import DragDiscussionTopicMutation from '../mutations/DragDiscussionTopicMutation'
import {cn} from '../ui/cn'
import {DISCUSSION_TOPIC, SORT_STEP} from '../utils/constants'
import dndNoise from '../utils/dndNoise'
import MeetingSidebarPhaseItemChild from './MeetingSidebarPhaseItemChild'
import MeetingSubnavItem from './MeetingSubnavItem'

// navItemRaised (Elevation.Z8)
const navItemRaisedShadowCls =
  'shadow-[rgba(0,0,0,.2)_0px_5px_5px_-3px,rgba(0,0,0,.14)_0px_8px_10px_1px,rgba(0,0,0,.12)_0px_3px_14px_2px]'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  meeting: RetroSidebarDiscussSection_meeting$key
}

type NonNullPhase = DeepNonNullable<RetroSidebarDiscussSection_meeting$data['phases'][0]>

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
    gotoStageId(id).catch(() => {
      /*ignore*/
    })
    handleMenuClick()
  }
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <MeetingSidebarPhaseItemChild>
        <Droppable droppableId={DISCUSSION_TOPIC}>
          {(provided) => {
            return (
              <div
                className='h-full overflow-auto pr-2 pb-2'
                data-cy='discussion-section'
                ref={provided.innerRef}
              >
                {stages.map((stage, idx) => {
                  const {reflectionGroup} = stage
                  if (!reflectionGroup) return null
                  const {title, voteCount, reflections} = reflectionGroup
                  const reflectionColors = (reflections ?? []).map(({prompt}) => prompt.groupColor)
                  const colors = [...new Set(reflectionColors)]
                    .sort(
                      (a, b) =>
                        reflectionColors.filter((v) => v === b).length -
                        reflectionColors.filter((v) => v === a).length
                    )
                    .slice(0, 3)
                  // the local user is at another stage than the facilitator stage
                  const isUnsyncedFacilitatorStage = !inSync && stage.id === facilitatorStageId
                  const voteMeta = (
                    // NavSidebar.SUB_FONT_SIZE === 14px, SUB_LINE_HEIGHT === 22px
                    <div
                      className={cn(
                        'mr-2 flex h-[22px] items-center font-semibold text-sm leading-[22px]',
                        isUnsyncedFacilitatorStage ? 'text-rose-500' : 'text-fg-nav-muted'
                      )}
                    >
                      <ThumbUp className='mr-0.5 h-4.5 w-4.5 text-inherit' />
                      {voteCount || 0}
                    </div>
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
                          <div
                            data-cy={`discuss-item-${idx}`}
                            className={cn(dragSnapshot.isDragging && navItemRaisedShadowCls)}
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
                              <div className='flex w-full items-center space-x-0.5'>
                                <div>
                                  {colors.map((color, idx) => {
                                    const DOT_SIZE = 8
                                    const TOTAL_HEIGHT = 18
                                    const DESIRED_VISIBLE = 4 // how much of each lower dot shows

                                    const visible =
                                      colors.length > 1
                                        ? Math.min(
                                            DESIRED_VISIBLE,
                                            (TOTAL_HEIGHT - DOT_SIZE) / (colors.length - 1)
                                          )
                                        : 0

                                    const overlap = DOT_SIZE - visible

                                    return (
                                      <div
                                        key={idx}
                                        style={{
                                          backgroundColor: color,
                                          marginTop: idx === 0 ? 0 : -overlap,
                                          zIndex: colors.length - idx
                                        }}
                                        className='relative h-2 w-2 rounded-full'
                                      />
                                    )
                                  })}
                                </div>
                                <div>{title!}</div>
                              </div>
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
        reflections {
          prompt {
            groupColor
          }
        }
      }
      sortOrder
    }
  }
`

export default RetroSidebarDiscussSection
