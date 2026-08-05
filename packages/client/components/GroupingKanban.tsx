import {datadogRum} from '@datadog/browser-rum'
import graphql from 'babel-plugin-relay/macro'
import {AnimatePresence} from 'motion/react'
import {type RefObject, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import type {GroupingKanban_meeting$key} from '~/__generated__/GroupingKanban_meeting.graphql'
import useCallbackRef from '~/hooks/useCallbackRef'
import useAnimatedSpotlightSource from '../hooks/useAnimatedSpotlightSource'
import useAtmosphere from '../hooks/useAtmosphere'
import useBreakpoint from '../hooks/useBreakpoint'
import useHideBodyScroll from '../hooks/useHideBodyScroll'
import useHoverSuggestedGroup from '../hooks/useHoverSuggestedGroup'
import useSpotlightSimulatedDrag from '../hooks/useSpotlightSimulatedDrag'
import useSuggestedGroupsReveal from '../hooks/useSuggestedGroupsReveal'
import useThrottledEvent from '../hooks/useThrottledEvent'
import EndDraggingReflectionMutation from '../mutations/EndDraggingReflectionMutation'
import {Breakpoint, Times} from '../types/constEnums'
import {cn} from '../ui/cn'
import {getMergeableSuggestedGroupIds} from '../utils/smartGroup/suggestionLookup'
import PortalProvider from './AtmosphereProvider/PortalProvider'
import GroupingKanbanColumn from './GroupingKanbanColumn'
import ReflectWrapperMobile from './RetroReflectPhase/ReflectionWrapperMobile'
import ReflectWrapperDesktop from './RetroReflectPhase/ReflectWrapperDesktop'
import SpotlightModal from './SpotlightModal'

interface Props {
  meeting: GroupingKanban_meeting$key
  phaseRef: RefObject<HTMLDivElement>
}

export type SwipeColumn = (offset: number) => void
const GroupingKanban = (props: Props) => {
  const {meeting: meetingRef, phaseRef} = props
  const meeting = useFragment(
    graphql`
      fragment GroupingKanban_meeting on RetrospectiveMeeting {
        ...GroupingKanbanColumn_meeting
        ...ReflectionGroup_meeting
        ...SpotlightModal_meeting
        id
        teamId
        localPhase {
          phaseType
        }
        localStage {
          isComplete
        }
        meetingMembers {
          id
        }
        meetingNumber
        phases {
          ... on ReflectPhase {
            phaseType
            reflectPrompts {
              ...GroupingKanbanColumn_prompt
              id
            }
          }
        }
        reflectionGroups {
          ...GroupingKanbanColumn_reflectionGroups
          id
          promptId
          activeReflectionGroupSimilarity
          reflections {
            id
            isViewerDragging
            isEditing
          }
        }
        suggestedGrouping {
          groups {
            id
            reflectionIds
          }
        }
        suggestedGroupingRevealAt
        isSuggestedGroupingHidden
        spotlightReflectionId
        spotlightGroup {
          ...ReflectionGroup_reflectionGroup
          id
          reflections {
            id
          }
        }
        spotlightSearchQuery
      }
    `,
    meetingRef
  )
  const {
    reflectionGroups,
    phases,
    spotlightReflectionId,
    spotlightGroup,
    localPhase,
    localStage,
    meetingNumber,
    meetingMembers,
    suggestedGrouping,
    suggestedGroupingRevealAt,
    isSuggestedGroupingHidden
  } = meeting
  // Dismissed suggestions are treated as no suggestions at all, so the badges, the hover outlines
  // and the reveal flash all go quiet from one flag
  const suggestions = isSuggestedGroupingHidden ? null : suggestedGrouping?.groups
  const {phaseType} = localPhase
  const {isComplete} = localStage
  const reflectPhase = phases.find((phase) => phase.phaseType === 'reflect')!
  const reflectPrompts = reflectPhase.reflectPrompts!
  const reflectPromptsCount = reflectPrompts.length
  const [callbackRef, columnsRef] = useCallbackRef()
  const isGroupPhase = !isComplete && phaseType === 'group'
  const atmosphere = useAtmosphere()
  // Driven by what was actually stored rather than this viewer's modal settings, so the outline
  // always matches the live suggestions — including ones a teammate generated
  const rawOnHoverReflection = useHoverSuggestedGroup(reflectionGroups, isGroupPhase, suggestions)
  const isRevealingSuggestions = useSuggestedGroupsReveal(
    reflectionGroups,
    suggestions,
    suggestedGroupingRevealAt
  )

  // Each of these groups wears a corner badge, so a suggestion is discoverable without hovering
  // every card to find one. Recomputed as cards move: merging a suggestion retires its badges
  const suggestedGroupIds = useMemo(
    () =>
      isGroupPhase
        ? getMergeableSuggestedGroupIds(suggestions, reflectionGroups)
        : new Set<string>(),
    [isGroupPhase, suggestions, reflectionGroups]
  )

  const draggedReflectionId = useMemo(() => {
    for (const group of reflectionGroups) {
      const dragging = group.reflections.find((r) => r.isViewerDragging)
      if (dragging) return dragging.id
    }
    return null
  }, [reflectionGroups])

  // Keep a ref so the drag effect always calls the latest version without being in its deps
  const rawOnHoverRef = useRef(rawOnHoverReflection)
  useEffect(() => {
    rawOnHoverRef.current = rawOnHoverReflection
  }, [rawOnHoverReflection])

  // When a drag starts or ends, re-run similarity for the dragged card (or clear on end). Card
  // intent: a drag asks where this one card belongs, not where the stack it left would go
  useEffect(() => {
    rawOnHoverRef.current(draggedReflectionId, 'card')
  }, [draggedReflectionId])

  // Hovering the Group button arms the merge: the source and every match share one lit color so the
  // viewer can see the whole set that is about to collapse into a single group
  const [isGroupMatchArmed, setIsGroupMatchArmed] = useState(false)

  const onHoverReflection = useCallback(
    (reflectionId: string | null) => {
      if (draggedReflectionId) return
      // Leaving the card takes the button with it, so nothing stays lit without its trigger
      if (!reflectionId) setIsGroupMatchArmed(false)
      rawOnHoverReflection(reflectionId, 'group')
    },
    [draggedReflectionId, rawOnHoverReflection]
  )

  // The "Group" button on a hovered card: move every reflection sitting in a currently-matched
  // group (activeReflectionGroupSimilarity === 1) into the hovered card's group. Reuses the same
  // mutation a real drag-and-drop already calls — no new mutation needed.
  const onGroupMatches = useCallback(
    (sourceGroupId: string) => {
      const matchedReflectionIds: string[] = []
      for (const group of reflectionGroups) {
        if (group.id === sourceGroupId) continue
        if (group.activeReflectionGroupSimilarity === 1) {
          for (const reflection of group.reflections) matchedReflectionIds.push(reflection.id)
        }
      }
      matchedReflectionIds.forEach((reflectionId) => {
        EndDraggingReflectionMutation(atmosphere, {
          reflectionId,
          dropTargetType: 'REFLECTION_GROUP',
          dropTargetId: sourceGroupId
        })
      })
      onHoverReflection(null)
    },
    [reflectionGroups, atmosphere, onHoverReflection]
  )

  useHideBodyScroll()
  const dragIdRef = useRef<string>()
  const {onOpenSpotlight, onCloseSpotlight} = useSpotlightSimulatedDrag(meeting, dragIdRef)

  const isSpotlightOpen = !!spotlightGroup

  const closeSpotlight = () => {
    sourceCloneRef.current = null
    onCloseSpotlight()
  }

  const {sourceRef, sourceCloneRef} = useAnimatedSpotlightSource(
    isSpotlightOpen,
    spotlightReflectionId,
    dragIdRef
  )

  useEffect(() => {
    window.onbeforeunload = () => {
      closeSpotlight()
    }
  }, [])

  const openSpotlight = (reflectionId: string, reflectionRef: RefObject<HTMLDivElement>) => {
    sourceCloneRef.current = reflectionRef.current
    onOpenSpotlight(reflectionId)
  }

  const {groupsByPrompt, isAnyEditing} = useMemo(() => {
    const container = {} as {
      [promptId: string]: (typeof reflectionGroups)[0][]
    }
    let isEditing = false
    reflectionGroups.forEach((group) => {
      const {reflections, promptId} = group
      container[promptId] = container[promptId] ?? []
      container[promptId]!.push(group)
      if (!reflections) {
        datadogRum.addError(new Error('Invalid invariant: reflectionGroup.reflections is null'))
      } else if (!isEditing && reflections.some((reflection) => reflection.isEditing)) {
        isEditing = true
      }
    })
    return {groupsByPrompt: container, isAnyEditing: isEditing}
  }, [reflectionGroups])
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)
  const [activeIdx, setActiveIdx] = useState(0)
  const ColumnWrapper = isDesktop ? ReflectWrapperDesktop : ReflectWrapperMobile
  const isViewerDragging = useMemo(() => {
    return isDesktop
      ? false
      : !!reflectionGroups.find((group) =>
          group.reflections.find((reflection) => reflection.isViewerDragging)
        )
  }, [isDesktop, reflectionGroups])
  const swipeColumn: SwipeColumn = useThrottledEvent((offset: number) => {
    const nextIdx = Math.min(reflectPromptsCount - 1, Math.max(0, activeIdx + offset))
    setActiveIdx(nextIdx)
  }, Times.REFLECTION_COLUMN_SWIPE_THRESH)

  if (!phaseRef.current) return null

  const reflectionCount = reflectionGroups.reduce(
    (sum, {reflections}) => sum + reflections.length,
    0
  )
  const isRetrospectiveBeginner = meetingNumber < 3 // If the meeting number is low, the user is probably new to retrospectives
  const hasNoGroup = !reflectionGroups.some((group) => group.reflections.length > 1)
  const isNotInteracting =
    isGroupPhase &&
    hasNoGroup &&
    reflectionGroups.every((group) =>
      group.reflections.every((reflection) => !reflection.isViewerDragging && !reflection.isEditing)
    )
  const showDragHintAnimation =
    isNotInteracting &&
    isRetrospectiveBeginner &&
    meetingMembers.length === 1 &&
    reflectionCount > 1

  return (
    <PortalProvider>
      <div
        className={cn(
          'm-0 flex h-full w-full flex-1 flex-col items-center justify-center overflow-auto',
          isDesktop && 'px-4'
        )}
      >
        <ColumnWrapper
          setActiveIdx={setActiveIdx}
          activeIdx={activeIdx}
          disabled={isViewerDragging}
          ref={isDesktop ? callbackRef : undefined}
        >
          {reflectPrompts.map((prompt, index) => (
            <GroupingKanbanColumn
              columnsRef={columnsRef}
              isAnyEditing={isAnyEditing}
              isDesktop={isDesktop}
              key={prompt.id}
              meeting={meeting}
              onHoverReflection={onHoverReflection}
              onGroupMatches={onGroupMatches}
              onArmGroupMatches={setIsGroupMatchArmed}
              isGroupMatchArmed={isGroupMatchArmed}
              suggestedGroupIds={suggestedGroupIds}
              openSpotlight={openSpotlight}
              phaseRef={phaseRef}
              prompt={prompt}
              isRevealingSuggestions={isRevealingSuggestions}
              reflectionGroups={groupsByPrompt[prompt.id] || []}
              reflectPromptsCount={reflectPromptsCount}
              swipeColumn={swipeColumn}
              showDragHintAnimation={showDragHintAnimation && index === 0}
            />
          ))}
        </ColumnWrapper>
      </div>
      <AnimatePresence>
        {isSpotlightOpen && (
          <SpotlightModal
            closeSpotlight={closeSpotlight}
            meetingRef={meeting}
            sourceRef={sourceRef}
          />
        )}
      </AnimatePresence>
    </PortalProvider>
  )
}

export default GroupingKanban
