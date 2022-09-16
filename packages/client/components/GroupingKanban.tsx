import styled from '@emotion/styled'
import {captureException} from '@sentry/minimal'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject, useEffect, useMemo, useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import useCallbackRef from '~/hooks/useCallbackRef'
import {GroupingKanban_meeting} from '~/__generated__/GroupingKanban_meeting.graphql'
import useAnimatedSpotlightSource from '../hooks/useAnimatedSpotlightSource'
import useBreakpoint from '../hooks/useBreakpoint'
import useHideBodyScroll from '../hooks/useHideBodyScroll'
import useModal from '../hooks/useModal'
import useSpotlightSimulatedDrag from '../hooks/useSpotlightSimulatedDrag'
import useThrottledEvent from '../hooks/useThrottledEvent'
import {Breakpoint, Times} from '../types/constEnums'
import PortalProvider from './AtmosphereProvider/PortalProvider'
import GroupingKanbanColumn from './GroupingKanbanColumn'
import ReflectWrapperMobile from './RetroReflectPhase/ReflectionWrapperMobile'
import ReflectWrapperDesktop from './RetroReflectPhase/ReflectWrapperDesktop'
import SpotlightModal from './SpotlightModal'

interface Props {
  meeting: GroupingKanban_meeting
  phaseRef: RefObject<HTMLDivElement>
}

const ColumnsBlock = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  alignItems: 'center',
  display: 'flex',
  flex: '1',
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'center',
  margin: '0 auto',
  overflow: 'auto',
  padding: isDesktop ? '0 0 16px' : undefined,
  width: '100%'
}))
export type SwipeColumn = (offset: number) => void
const GroupingKanban = (props: Props) => {
  const {meeting, phaseRef} = props
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
  useHideBodyScroll()
  const dragIdRef = useRef<string>()
  const {onOpenSpotlight, onCloseSpotlight} = useSpotlightSimulatedDrag(meeting, dragIdRef)
  const closeSpotlight = () => {
    sourceCloneRef.current = null
    onCloseSpotlight()
  }
  const {closePortal, openPortal, modalPortal, portalStatus} = useModal({
    onClose: closeSpotlight,
    id: 'spotlight'
  })
  const {sourceRef, sourceCloneRef} = useAnimatedSpotlightSource(
    portalStatus,
    spotlightReflectionId,
    dragIdRef
  )

  // Open and close the portal as an effect since on dragging conflict the spotlight reflection may be unset which should also close the portal.
  useEffect(() => {
    window.onbeforeunload = () => {
      closePortal()
    }
    if (spotlightGroup) {
      openPortal()
    } else {
      closePortal()
    }
  }, [!spotlightGroup])

  const openSpotlight = (reflectionId: string, reflectionRef: RefObject<HTMLDivElement>) => {
    sourceCloneRef.current = reflectionRef.current
    onOpenSpotlight(reflectionId)
  }

  const {groupsByPrompt, isAnyEditing} = useMemo(() => {
    const container = {} as {[promptId: string]: typeof reflectionGroups[0][]}
    let isEditing = false
    reflectionGroups.forEach((group) => {
      const {reflections, promptId} = group
      container[promptId] = container[promptId] ?? []
      container[promptId]!.push(group)
      if (!reflections) {
        captureException(new Error('Invalid invariant: reflectionGroup.reflections is null'))
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
  const isGroupPhase = !isComplete && phaseType === 'group'
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
      <ColumnsBlock isDesktop={isDesktop}>
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
      </ColumnsBlock>
      {modalPortal(
        <SpotlightModal
          closeSpotlight={closePortal}
          meetingRef={meeting}
          sourceRef={sourceRef}
          portalStatus={portalStatus}
        />
      )}
    </PortalProvider>
  )
}

export default createFragmentContainer(GroupingKanban, {
  meeting: graphql`
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
  `
})
