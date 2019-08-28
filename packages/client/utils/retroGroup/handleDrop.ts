import Atmosphere from '../../Atmosphere'
import {DragReflectionDropTargetTypeEnum} from '../../types/graphql'
import {commitLocalUpdate} from 'relay-runtime'
import {Times} from '../../types/constEnums'
import EndDraggingReflectionMutation from '../../mutations/EndDraggingReflectionMutation'

const handleDrop = (atmosphere: Atmosphere, reflectionId: string, drag: any, dropTargetType: DragReflectionDropTargetTypeEnum | null, dropTargetId: string | null) => {
  commitLocalUpdate(atmosphere, (store) => {
    store.get(reflectionId)!.setValue(true, 'isDropping')
  })

  EndDraggingReflectionMutation(atmosphere, {
    reflectionId,
    dropTargetType,
    dropTargetId,
    dragId: '1'
  })
}

export default handleDrop
