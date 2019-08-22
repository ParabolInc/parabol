import React, {useMemo} from 'react'
import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import {DragDropContext, DragStart, DropResult} from 'react-beautiful-dnd'
import {GroupingKanban_meeting} from '__generated__/GroupingKanban_meeting.graphql'
import {DragReflectionDropTargetTypeEnum, NewMeetingPhaseTypeEnum} from '../types/graphql'
import styled from '@emotion/styled'
import GroupingKanbanColumn from './GroupingKanbanColumn'
import useEventCallback from '../hooks/useEventCallback'
import {SORT_STEP} from '../utils/constants'
import dndNoise from '../utils/dndNoise'
import UpdateTaskMutation from '../mutations/UpdateTaskMutation'
import EndDraggingReflectionMutation from '../mutations/EndDraggingReflectionMutation'
import useAtmosphere from '../hooks/useAtmosphere'
import clientTempId from '../utils/relay/clientTempId'
import StartDraggingReflectionMutation from '../mutations/StartDraggingReflectionMutation'
import {MasonryAtmosphere} from './PhaseItemMasonry'

interface Props {
  meeting: GroupingKanban_meeting,
  resetActivityTimeout: () => void
}

const ColumnsBlock = styled('div')({
  display: 'flex',
  flex: '1',
  height: '100%',
  margin: '0 auto',
  // overflow: 'auto',
  width: '100%',
})

const getReflection = (reflectionId: string, reflectionGroups: GroupingKanban_meeting['reflectionGroups']) => {
  for (let i = 0; i < reflectionGroups.length; i++) {
    const group = reflectionGroups[i]
    const {reflections} = group
    for (let j = 0; j < reflections.length; j++) {
      const reflection = reflections[j]
      if (reflection.id === reflectionId) {
        return reflection
      }
    }
  }
  return undefined
}
const GroupingKanban = (props: Props) => {
  const {meeting} = props
  const {id: meetingId, reflectionGroups, phases} = meeting
  const reflectPhase = phases.find((phase) => phase.phaseType === NewMeetingPhaseTypeEnum.reflect)!
  const reflectPrompts = reflectPhase.reflectPrompts!
  const atmosphere = useAtmosphere()
  const groupsByPhaseItem = useMemo(() => {
    const container = {} as {[phaseItemId: string]: typeof reflectionGroups[0][]}
    for (let i = 0; i < reflectionGroups.length; i++) {
      const group = reflectionGroups[i]
      const {retroPhaseItemId} = group
      container[retroPhaseItemId] = container[retroPhaseItemId] || []
      container[retroPhaseItemId].push(group)
    }
    return container
  }, [reflectionGroups])

  const onDragStart = useEventCallback((result: DragStart) => {
    const {draggableId, source} = result
    console.log('res', result)
    StartDraggingReflectionMutation(
      atmosphere,
      {reflectionId: draggableId, initialCoords: {x: 0, y: 0}},
      {initialCursorCoords: {x: 0, y: 0}, meetingId}
    )
  })

  const onDragEnd = useEventCallback((result: DropResult) => {
    const {source, combine, draggableId} = result
    const reflection = getReflection(draggableId, reflectionGroups)
    if (combine) {
      const {draggableId: targetId} = combine
      const targetReflection = getReflection(targetId, reflectionGroups)
      if (!reflection) return
      const newReflectionGroupId = clientTempId()
      EndDraggingReflectionMutation(
        atmosphere,
        {
          reflectionId: draggableId,
          dropTargetType: DragReflectionDropTargetTypeEnum.REFLECTION_GROUP,
          dropTargetId: targetReflection.reflectionGroupId,
          dragId: reflection.dragContext.id
        },
        {meetingId, newReflectionGroupId}
      )
    } else {
      const newReflectionGroupId = clientTempId()
      EndDraggingReflectionMutation(
        atmosphere,
        {
          reflectionId: draggableId,
          dropTargetType: null,
          dragId: reflection.dragContext.id
        },
        {meetingId, newReflectionGroupId}
      )
    }
  })
  return (
    <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
      <ColumnsBlock>
        {reflectPrompts.map((prompt) => (
          <GroupingKanbanColumn
            key={prompt.id}
            meeting={meeting}
            prompt={prompt}
            reflectionGroups={groupsByPhaseItem[prompt.id] || []}
          />
        ))}
      </ColumnsBlock>
    </DragDropContext>
  )
}

export default createFragmentContainer(
  GroupingKanban,
  {
    meeting: graphql`
      fragment GroupingKanban_meeting on RetrospectiveMeeting {
        ...GroupingKanbanColumn_meeting
        id
        phases {
          ...on ReflectPhase {
            phaseType
            reflectPrompts {
              ...GroupingKanbanColumn_prompt
              id
              title
            }
          }
        }
        reflectionGroups {
          ...GroupingKanbanColumn_reflectionGroups
          retroPhaseItemId
          reflections {
            id
            reflectionGroupId
            dragContext {
              id
            }
          }
        }
      }`
  }
)
