import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject, useMemo, useRef, useState} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import useCallbackRef from '~/hooks/useCallbackRef'
import useMutationProps from '~/hooks/useMutationProps'
import EndDraggingReflectionMutation from '~/mutations/EndDraggingReflectionMutation'
import StartDraggingReflectionMutation from '~/mutations/StartDraggingReflectionMutation'
import clientTempId from '~/utils/relay/clientTempId'
import cloneReflection from '~/utils/retroGroup/cloneReflection'
import {GroupingKanban_meeting} from '~/__generated__/GroupingKanban_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useBreakpoint from '../hooks/useBreakpoint'
import useHideBodyScroll from '../hooks/useHideBodyScroll'
import useModal from '../hooks/useModal'
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
  const {id: meetingId, reflectionGroups, phases, spotlightGroup, spotlightReflectionId} = meeting
  const spotlightGroupId = spotlightGroup?.id
  const reflectPhase = phases.find((phase) => phase.phaseType === 'reflect')!
  const reflectPrompts = reflectPhase.reflectPrompts!
  const reflectPromptsCount = reflectPrompts.length
  const sourceRef = useRef<HTMLDivElement | null>(null)
  const [callbackRef, columnsRef] = useCallbackRef()
  const atmosphere = useAtmosphere()
  const {onError, onCompleted} = useMutationProps()
  useHideBodyScroll()
  const tempIdRef = useRef<null | string>(null)
  if (tempIdRef.current === null) {
    tempIdRef.current = clientTempId()
  }

  const closeSpotlight = () => {
    closePortal()
    EndDraggingReflectionMutation(atmosphere, {
      reflectionId: spotlightReflectionId!,
      dropTargetType: null,
      dropTargetId: null,
      dragId: tempIdRef.current
    })
    tempIdRef.current = null
    sourceRef.current = null
    commitLocalUpdate(atmosphere, (store) => {
      const meeting = store.get(meetingId)
      const reflection = store.get(spotlightGroupId!)
      if (!reflection || !meeting) return
      meeting.setValue(null, 'spotlightGroup')
      meeting.setValue(null, 'spotlightReflectionId')
      // isDropping so that the source is added back to its original position in kanban
      reflection.setValue(true, 'isDropping')
    })
  }
  const {closePortal, openPortal, modalPortal} = useModal({
    onClose: closeSpotlight,
    id: 'spotlight'
  })
  const {groupsByPrompt, isAnyEditing} = useMemo(() => {
    const container = {} as {[promptId: string]: typeof reflectionGroups[0][]}
    let isEditing = false
    for (let i = 0; i < reflectionGroups.length; i++) {
      const group = reflectionGroups[i]
      const {reflections, promptId} = group
      container[promptId] = container[promptId] || []
      container[promptId].push(group)
      if (!isEditing && reflections.some((reflection) => reflection.isEditing)) {
        isEditing = true
      }
    }
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

  const openSpotlight = (reflectionId: string, reflectionRef: RefObject<HTMLDivElement>) => {
    sourceRef.current = reflectionRef.current
    const clone = cloneReflection(sourceRef.current!, reflectionId)
    // clone before element is altered by StartDraggingReflectionMutation
    // opacity 0 until the position is determined
    clone.style.opacity = '0'
    openPortal()
    commitLocalUpdate(atmosphere, (store) => {
      const meeting = store.get<GroupingKanban_meeting>(meetingId)
      const reflection = store.get(reflectionId)
      const reflectionGroupId = reflection?.getValue('reflectionGroupId') as string
      const reflectionGroup = store.get(reflectionGroupId)
      if (!meeting || !reflectionGroup) return
      meeting.setLinkedRecord(reflectionGroup, 'spotlightGroup')
      meeting.setValue(reflectionId, 'spotlightReflectionId')
    })
    if (!tempIdRef.current) return
    const handleCompleted = () => {
      commitLocalUpdate(atmosphere, (store) => {
        const reflection = store.get(reflectionId)
        reflection?.setValue(false, 'isViewerDragging')
      })
      onCompleted()
    }
    StartDraggingReflectionMutation(
      atmosphere,
      {
        reflectionId,
        dragId: tempIdRef.current
      },
      {onError, onCompleted: handleCompleted}
    )
  }

  if (!phaseRef.current) return null
  return (
    <PortalProvider>
      <ColumnsBlock isDesktop={isDesktop}>
        <ColumnWrapper
          setActiveIdx={setActiveIdx}
          activeIdx={activeIdx}
          disabled={isViewerDragging}
          ref={isDesktop ? callbackRef : undefined}
        >
          {reflectPrompts.map((prompt) => (
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
            />
          ))}
        </ColumnWrapper>
      </ColumnsBlock>
      {modalPortal(
        <SpotlightModal
          closeSpotlight={closeSpotlight}
          phaseRef={phaseRef}
          sourceRef={sourceRef}
          meeting={meeting}
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
      id
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
    }
  `
})
