import {ReflectionGroup_meeting} from '../../__generated__/ReflectionGroup_meeting.graphql'
import {ReflectionGroup_reflectionGroup} from '../../__generated__/ReflectionGroup_reflectionGroup.graphql'
import React, {useMemo, useRef, useState} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {NewMeetingPhaseTypeEnum} from '../../types/graphql'
import DraggableReflectionCard from './DraggableReflectionCard'
import {Layout, ReflectionStackPerspective, Times} from '../../types/constEnums'
import ReflectionGroupHeader from '../ReflectionGroupHeader'

const CardStack = styled('div')({
  position: 'relative'
})

const Group = styled('div')<{staticReflectionCount: number}>(({staticReflectionCount}) => ({
  position: 'relative',
  minHeight: 90,
  background: 'lightblue',
  padding: Layout.REFLECTION_CARD_PADDING_Y,
  paddingBottom: Layout.REFLECTION_CARD_PADDING_Y + (Math.min(3, staticReflectionCount) - 1) * ReflectionStackPerspective.Y,
  transition: `padding-bottom ${Times.REFLECTION_DROP_DURATION}ms`
}))

const CenteredCardStack = styled('div')({
  position: 'relative'
})

interface Props {
  meeting: ReflectionGroup_meeting
  reflectionGroup: ReflectionGroup_reflectionGroup
}

const ReflectionGroup = (props: Props) => {
  const {meeting, reflectionGroup} = props
  const {localPhase, localStage} = meeting
  const {phaseType} = localPhase
  const {isComplete} = localStage
  const {reflections, id: reflectionGroupId} = reflectionGroup
  // const {modalPortal} = useModal()
  const [isEditingSingleCardTitle] = useState(false)
  const titleInputRef = useRef(null)
  const isDraggable = phaseType === NewMeetingPhaseTypeEnum.group && !isComplete
  const staticReflections = useMemo(() => {
    return reflections.filter((reflection) => !reflection.isViewerDragging && !reflection.remoteDrag)
  }, [reflections])
  return (
    <>
      <Group staticReflectionCount={staticReflections.length} data-droppable={reflectionGroupId}>
        <ReflectionGroupHeader
          meeting={meeting}
          reflectionGroup={reflectionGroup}
          isEditingSingleCardTitle={isEditingSingleCardTitle}
          titleInputRef={titleInputRef}
        />
        <CardStack>
          <CenteredCardStack>
            {reflections.map((reflection) => {
              return (
                <DraggableReflectionCard
                  key={reflection.id}
                  staticIdx={staticReflections.indexOf(reflection)}
                  isDraggable={isDraggable}
                  meeting={meeting}
                  reflection={reflection}
                  staticReflections={staticReflections}
                />
              )
            })}
          </CenteredCardStack>
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
          remoteDrag {
            dragUserId
          }
        }
        isExpanded
      }
    `
  }
)
