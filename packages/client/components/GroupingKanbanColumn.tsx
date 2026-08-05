import graphql from 'babel-plugin-relay/macro'
import {type RefObject, useMemo, useRef} from 'react'
import {useFragment} from 'react-relay'
import type {GroupingKanbanColumn_meeting$key} from '~/__generated__/GroupingKanbanColumn_meeting.graphql'
import type {GroupingKanbanColumn_prompt$key} from '~/__generated__/GroupingKanbanColumn_prompt.graphql'
import type {GroupingKanbanColumn_reflectionGroups$key} from '~/__generated__/GroupingKanbanColumn_reflectionGroups.graphql'
import {useCoverable} from '~/hooks/useControlBarCovers'
import useDeepEqual from '~/hooks/useDeepEqual'
import useSubColumns from '~/hooks/useSubColumns'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import CreateReflectionMutation from '../mutations/CreateReflectionMutation'
import {DragAttribute, MeetingControlBarEnum} from '../types/constEnums'
import {cn} from '../ui/cn'
import getNextSortOrder from '../utils/getNextSortOrder'
import type {SwipeColumn} from './GroupingKanban'
import GroupingKanbanColumnHeader from './GroupingKanbanColumnHeader'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'
import ScrollEdgeIndicator from './ScrollEdgeIndicator'

export type OpenSpotlight = (
  reflectionGroupId: string,
  reflectionRef: RefObject<HTMLDivElement>
) => void

interface Props {
  columnsRef: RefObject<HTMLDivElement>
  isAnyEditing: boolean
  isDesktop: boolean
  meeting: GroupingKanbanColumn_meeting$key
  onHoverReflection: (reflectionId: string | null) => void
  onGroupMatches: (reflectionGroupId: string) => void
  onArmGroupMatches: (isArmed: boolean) => void
  /** Hovering the Group button lights the source and every match in one shared color */
  isGroupMatchArmed: boolean
  /** Groups a suggestion would still merge, so each one can hint at it before being hovered */
  suggestedGroupIds: ReadonlySet<string>
  openSpotlight: OpenSpotlight
  phaseRef: RefObject<HTMLDivElement>
  prompt: GroupingKanbanColumn_prompt$key
  reflectionGroups: GroupingKanbanColumn_reflectionGroups$key
  reflectPromptsCount: number
  swipeColumn?: SwipeColumn
  showDragHintAnimation?: boolean
  /** A one-off reveal outlines every matching group at once, so "N similar" would count the board */
  isRevealingSuggestions?: boolean
}

const GroupingKanbanColumn = (props: Props) => {
  const {
    columnsRef,
    isAnyEditing,
    isDesktop,
    meeting: meetingRef,
    onHoverReflection,
    onGroupMatches,
    onArmGroupMatches,
    isGroupMatchArmed,
    suggestedGroupIds,
    openSpotlight,
    reflectionGroups: reflectionGroupsRef,
    phaseRef,
    prompt: promptRef,
    reflectPromptsCount,
    swipeColumn,
    showDragHintAnimation,
    isRevealingSuggestions
  } = props
  const meeting = useFragment(
    graphql`
      fragment GroupingKanbanColumn_meeting on RetrospectiveMeeting {
        ...ReflectionGroup_meeting
        id
        endedAt
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
      }
    `,
    meetingRef
  )
  const reflectionGroups = useFragment(
    graphql`
      fragment GroupingKanbanColumn_reflectionGroups on RetroReflectionGroup @relay(plural: true) {
        ...ReflectionGroup_reflectionGroup
        id
        activeReflectionGroupSimilarity
        reflections {
          id
        }
        sortOrder
        subColumnIdx
      }
    `,
    reflectionGroupsRef
  )
  const prompt = useFragment(
    graphql`
      fragment GroupingKanbanColumn_prompt on ReflectPrompt {
        id
        question
        groupColor
        sortOrder
      }
    `,
    promptRef
  )
  const {question, id: promptId, groupColor} = prompt
  const {id: meetingId, endedAt, localStage} = meeting
  const {isComplete, phaseType} = localStage
  const {submitting, onError, submitMutation, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()
  const columnRef = useRef<HTMLDivElement>(null)
  const columnBodyRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const similarGroupIds = useMemo(() => {
    const ids = new Set<string>()
    if (isRevealingSuggestions) return ids
    for (const group of reflectionGroups) {
      if (group.activeReflectionGroupSimilarity != null) ids.add(group.id)
    }
    return ids
  }, [reflectionGroups, isRevealingSuggestions])

  const isLengthExpanded =
    useCoverable(promptId, columnRef, MeetingControlBarEnum.COVER_HEIGHT, phaseRef, columnsRef) ||
    !!endedAt
  const groups = useDeepEqual(reflectionGroups)
  // group may be undefined because relay could GC before useMemo in the Kanban recomputes >:-(
  const filteredReflectionGroups = useMemo(
    () => groups.filter((group) => group.reflections.length > 0),
    [groups]
  )
  const [isWidthExpanded, subColumnIndexes, toggleWidth] = useSubColumns(
    columnBodyRef,
    phaseRef,
    reflectPromptsCount,
    filteredReflectionGroups,
    columnsRef
  )
  const canAdd = phaseType === 'group' && !isComplete && !isAnyEditing

  const onClick = () => {
    if (submitting || isAnyEditing) return
    const input = {
      content: undefined,
      meetingId,
      promptId,
      sortOrder: getNextSortOrder(filteredReflectionGroups)
    }
    submitMutation()
    CreateReflectionMutation(atmosphere, {input}, {onError, onCompleted})
  }
  return (
    <div
      className={`relative mr-2 ml-2 flex h-full min-w-80 single-reflection-column:max-w-min flex-1 flex-col content-start rounded-lg bg-surface-well p-0 transition-all duration-100 ease-out first-of-type:ml-4 last-of-type:mr-4 ${isLengthExpanded ? '' : 'single-reflection-column:h-[calc(100%-68px)]'} max-w-min`}
      ref={columnRef}
      data-cy={`group-column-${question}`}
    >
      <GroupingKanbanColumnHeader
        canAdd={canAdd}
        groupColor={groupColor}
        isWidthExpanded={isWidthExpanded}
        onClick={onClick}
        question={question}
        phaseType={phaseType}
        submitting={submitting}
        toggleWidth={toggleWidth}
      />
      <ScrollEdgeIndicator scrollRef={scrollContainerRef} similarGroupIds={similarGroupIds} />
      <div className='flex h-full overflow-y-auto overflow-x-hidden' ref={scrollContainerRef}>
        {subColumnIndexes.map((subColumnIdx) => {
          return (
            <div
              className={cn(
                'flex max-h-fit min-h-[200px] min-w-80 flex-1 flex-row flex-wrap content-start justify-around transition-all duration-100 ease-out',
                isWidthExpanded ? 'py-3' : 'py-1.5',
                isDesktop ? 'px-3' : 'px-2'
              )}
              data-cy={subColumnIdx === 0 ? `group-column-${question}-body` : undefined}
              key={`${promptId}-${subColumnIdx}`}
              ref={subColumnIdx === 0 ? columnBodyRef : undefined}
              {...{[DragAttribute.DROPZONE]: `${promptId}-${subColumnIdx}`}}
            >
              {filteredReflectionGroups
                .filter((group) => (isWidthExpanded ? group.subColumnIdx === subColumnIdx : true))
                .map((reflectionGroup, idx) => {
                  return (
                    <ReflectionGroup
                      dataCy={`${question}-group-${idx}`}
                      key={reflectionGroup.id}
                      meetingRef={meeting}
                      onHoverReflection={onHoverReflection}
                      onGroupMatches={onGroupMatches}
                      onArmGroupMatches={onArmGroupMatches}
                      isGroupMatchArmed={isGroupMatchArmed}
                      hasSuggestion={suggestedGroupIds.has(reflectionGroup.id)}
                      openSpotlight={openSpotlight}
                      phaseRef={phaseRef}
                      reflectionGroupRef={reflectionGroup}
                      swipeColumn={swipeColumn}
                      showDragHintAnimation={
                        showDragHintAnimation && subColumnIdx === 0 && idx === 0
                      }
                    />
                  )
                })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default GroupingKanbanColumn
