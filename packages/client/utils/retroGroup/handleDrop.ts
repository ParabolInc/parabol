import {commitLocalUpdate} from 'relay-runtime'
import {DragReflectionDropTargetTypeEnum} from '~/__generated__/EndDraggingReflectionMutation_meeting.graphql'
import Atmosphere from '../../Atmosphere'
import {ReflectionDragState} from '../../components/ReflectionGroup/DraggableReflectionCard'
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
