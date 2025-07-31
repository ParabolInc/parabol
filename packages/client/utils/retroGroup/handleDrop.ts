import {commitLocalUpdate} from 'relay-runtime'
import type {DragReflectionDropTargetTypeEnum} from '~/__generated__/EndDraggingReflectionMutation_meeting.graphql'
import type Atmosphere from '../../Atmosphere'
import type {ReflectionDragState} from '../../components/ReflectionGroup/DraggableReflectionCard'
import EndDraggingReflectionMutation from '../../mutations/EndDraggingReflectionMutation'

const handleDrop = (
  atmosphere: Atmosphere,
  reflectionId: string,
  drag: ReflectionDragState,
  dropTargetType: DragReflectionDropTargetTypeEnum | null,
  dropTargetId: string | null
) => {
  commitLocalUpdate(atmosphere, (store) => {
    store.get(reflectionId)!.setValue(true, 'isDropping')
  })

  EndDraggingReflectionMutation(atmosphere, {
    reflectionId,
    dropTargetType,
    dropTargetId,
    dragId: drag.id
  })
}

export default handleDrop
