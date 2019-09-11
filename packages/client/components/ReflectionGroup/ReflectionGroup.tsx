import {ReflectionGroup_meeting} from '../../__generated__/ReflectionGroup_meeting.graphql'
import {ReflectionGroup_reflectionGroup} from '../../__generated__/ReflectionGroup_reflectionGroup.graphql'
import React, {useMemo, useRef, useState} from 'react'
import styled from '@emotion/styled'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {NewMeetingPhaseTypeEnum} from '../../types/graphql'
import DraggableReflectionCard from './DraggableReflectionCard'
import {ElementWidth, Layout, ReflectionStackPerspective, Times} from '../../types/constEnums'
import ReflectionGroupHeader from '../ReflectionGroupHeader'
import ExpandedReflectionStack from '../RetroReflectPhase/ExpandedReflectionStack'
import useExpandedReflections from '../../hooks/useExpandedReflections'
import {GROUP} from '../../utils/constants'
import useAtmosphere from '../../hooks/useAtmosphere'

const CardStack = styled('div')({
  position: 'relative'
})

const Group = styled('div')<{staticReflectionCount: number}>(({staticReflectionCount}) => ({
  position: 'relative',
  padding: Layout.REFLECTION_CARD_PADDING_Y,
  paddingTop: staticReflectionCount === 0 ? 0 : undefined,
  paddingBottom: staticReflectionCount === 0 ? 0 : Layout.REFLECTION_CARD_PADDING_Y + (Math.min(3, staticReflectionCount) - 1) * ReflectionStackPerspective.Y,
  transition: `padding-bottom ${Times.REFLECTION_DROP_DURATION}ms`
}))

const ReflectionWrapper = styled('div')<{staticIdx: number, isDropping: boolean | null, isEditing: boolean, groupCount: number}>(
  ({staticIdx, isDropping, isEditing, groupCount}): any => {
    // const stackOrder = staticReflectionCount - staticIdx - 1
    const isHidden = staticIdx === -1 || isDropping
    const multiple = Math.min(staticIdx, 2)
    const scaleX = (ElementWidth.REFLECTION_CARD - ReflectionStackPerspective.X * multiple * 2) / ElementWidth.REFLECTION_CARD
    const translateY = ReflectionStackPerspective.Y * multiple
    return {
      cursor: staticIdx === 0 && !isHidden && !isEditing ? 'grab' : undefined,
      position: staticIdx === 0 || (staticIdx === -1 && groupCount === 1) ? 'relative' : 'absolute',
      bottom: 0,
      left: 0,
      outline: 0,
      opacity: isHidden ? 0 : undefined,
      transform: `translateY(${translateY}px) scaleX(${scaleX})`,
      zIndex: 3 - multiple,
      transition: isHidden ? undefined : `transform ${Times.REFLECTION_DROP_DURATION}ms`
    }
  }
)

interface Props {
  meeting: ReflectionGroup_meeting
  reflectionGroup: ReflectionGroup_reflectionGroup
}

const ReflectionGroup = (props: Props) => {
  const {meeting, phaseRef, reflectionGroup} = props
  const {id: meetingId, localPhase, localStage} = meeting
  const {phaseType} = localPhase
  const {isComplete} = localStage
  const {reflections, id: reflectionGroupId, titleIsUserDefined} = reflectionGroup
  const titleInputRef = useRef(null)
  const headerRef = useRef(null)
  const isDraggable = phaseType === NewMeetingPhaseTypeEnum.group && !isComplete
  const staticReflections = useMemo(() => {
    return reflections.filter((reflection) => !reflection.isViewerDragging && (!reflection.remoteDrag || reflection.isDropping))
  }, [reflections])
  const stackRef = useRef<HTMLDivElement>(null)
  const {setItemsRef, scrollRef, bgRef, portal, collapse, expand} = useExpandedReflections(stackRef, reflections.length)
  const atmosphere = useAtmosphere()
  const [isEditing, thisSetIsEditing] = useState(false)

  const setIsEditing = (isEditing: boolean) => {
    thisSetIsEditing(isEditing)
    const [firstReflection] = staticReflections
    const {id: firstReflectionId} = firstReflection
    commitLocalUpdate(atmosphere, (store) => {
      const reflection = store.get(firstReflectionId)!
      reflection.setValue(isEditing, 'isEditing')
    })
  }

  const onClick = () => {
    if (isEditing) return
    const wasDrag = staticReflections.some((reflection) => reflection.isDropping)
    if (wasDrag) return
    if (reflections.length === 1) {
      setIsEditing(true)
      const watchForClick = (e) => {
        const isClickOnGroup = e.composedPath().find((el) => el === stackRef.current)
        if (!isClickOnGroup) {
          document.removeEventListener('click', watchForClick)
          setIsEditing(false)
        }
      }
      document.addEventListener('click', watchForClick)
    } else {
      expand()
    }
  }

  const showHeader = phaseType !== GROUP || titleIsUserDefined || reflections.length > 1 || isEditing
  return (
    <>
      {portal(<ExpandedReflectionStack
        header={<ReflectionGroupHeader
          isExpanded
          ref={headerRef}
          meeting={meeting}
          reflectionGroup={reflectionGroup}
          titleInputRef={titleInputRef}
        />}
        phaseRef={phaseRef}
        reflectionStack={staticReflections}
        reflections={reflections}
        meetingId={meetingId}
        readOnly={false}
        scrollRef={scrollRef}
        bgRef={bgRef}
        setItemsRef={setItemsRef}
        closePortal={collapse}
        showOriginFooter
        meeting={meeting}
      />)}
      <Group staticReflectionCount={staticReflections.length} data-droppable={reflectionGroupId}>
        {showHeader && <ReflectionGroupHeader
          ref={headerRef}
          meeting={meeting}
          reflectionGroup={reflectionGroup}
          titleInputRef={titleInputRef}
        />}
        <CardStack ref={stackRef} onClick={onClick}>
          {reflections.map((reflection) => {
            const staticIdx = staticReflections.indexOf(reflection)
            const {id: reflectionId, isDropping, isEditing} = reflection
            return (
              <ReflectionWrapper key={reflectionId} groupCount={reflections.length} staticIdx={staticIdx} isDropping={isDropping} isEditing={isEditing}>
                <DraggableReflectionCard
                  key={reflection.id}
                  staticIdx={staticIdx}
                  isDraggable={isDraggable}
                  meeting={meeting}
                  reflection={reflection}
                  staticReflections={staticReflections}
                />
              </ReflectionWrapper>
            )
          })}
        </CardStack>
      </Group>
    </>
  )
}

export default createFragmentContainer(ReflectionGroup,
  {
    meeting: graphql`
      fragment ReflectionGroup_meeting on RetrospectiveMeeting {
        ...DraggableReflectionCard_meeting
        id
        ...ReflectionGroupHeader_meeting
        localPhase {
          phaseType
        }
        localStage {
          isComplete
        }
        isViewerDragInProgress
      }
    `,
    reflectionGroup: graphql`
      fragment ReflectionGroup_reflectionGroup on RetroReflectionGroup {
        ...ReflectionGroupHeader_reflectionGroup
        retroPhaseItemId
        id
        sortOrder
        titleIsUserDefined
        reflections {
          ...DraggableReflectionCard_reflection
          ...DraggableReflectionCard_staticReflections
          ...ReflectionCard_reflection
          id
          retroPhaseItemId
          sortOrder
          isViewerDragging
          isDropping
          isEditing
          remoteDrag {
            dragUserId
          }
        }
        isExpanded
      }
    `
  }
)
