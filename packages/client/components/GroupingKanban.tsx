import {datadogRum} from '@datadog/browser-rum'
import graphql from 'babel-plugin-relay/macro'
import {AnimatePresence} from 'motion/react'
import {type RefObject, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import type {GroupingKanban_meeting$key} from '~/__generated__/GroupingKanban_meeting.graphql'
import useCallbackRef from '~/hooks/useCallbackRef'
import useAnimatedSpotlightSource from '../hooks/useAnimatedSpotlightSource'
import useBreakpoint from '../hooks/useBreakpoint'
import useHideBodyScroll from '../hooks/useHideBodyScroll'
import useHoverReflectionSimilarity from '../hooks/useHoverReflectionSimilarity'
import useSpotlightSimulatedDrag from '../hooks/useSpotlightSimulatedDrag'
import useThrottledEvent from '../hooks/useThrottledEvent'
import {Breakpoint, Times} from '../types/constEnums'
import {cn} from '../ui/cn'
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
          reflections {
            id
            isViewerDragging
            isEditing
            embeddingVector
          }
        }
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
    meetingMembers
  } = meeting
  const {phaseType} = localPhase
  const {isComplete} = localStage
  const reflectPhase = phases.find((phase) => phase.phaseType === 'reflect')!
  const reflectPrompts = reflectPhase.reflectPrompts!
  const reflectPromptsCount = reflectPrompts.length
  const [callbackRef, columnsRef] = useCallbackRef()
  const isGroupPhase = !isComplete && phaseType === 'group'
  const rawOnHoverReflection = useHoverReflectionSimilarity(reflectionGroups, isGroupPhase)

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

  // When a drag starts or ends, re-run similarity for the dragged card (or clear on end)
  useEffect(() => {
    rawOnHoverRef.current(draggedReflectionId)
  }, [draggedReflectionId])

  const onHoverReflection = useCallback(
    (reflectionId: string | null) => {
      if (draggedReflectionId) return
      rawOnHoverReflection(reflectionId)
    },
    [draggedReflectionId, rawOnHoverReflection]
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
              openSpotlight={openSpotlight}
              phaseRef={phaseRef}
              prompt={prompt}
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
