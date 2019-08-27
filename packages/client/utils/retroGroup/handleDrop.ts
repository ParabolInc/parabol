import Atmosphere from '../../Atmosphere'
import {DragReflectionDropTargetTypeEnum} from '../../types/graphql'
import {commitLocalUpdate} from 'relay-runtime'
import {Times} from '../../types/constEnums'
import EndDraggingReflectionMutation from '../../mutations/EndDraggingReflectionMutation'

const handleDrop = (atmosphere: Atmosphere, reflectionId: string, drag: any, dropTargetType: DragReflectionDropTargetTypeEnum | null, dropTargetId: string | null) => {
  commitLocalUpdate(atmosphere, (store) => {
    store.get(reflectionId)!.setValue(true, 'isDropping')
  })

  setTimeout(() => {
    commitLocalUpdate(atmosphere, (store) => {
      store.get(reflectionId)!.setValue(false, 'isDropping')
    })
    document.body.removeChild(drag.clone!)
    drag.clone = null
  }, Times.REFLECTION_DROP_DURATION)

  EndDraggingReflectionMutation(atmosphere, {
    reflectionId,
    dropTargetType,
    dropTargetId,
    dragId: '1'
  })
}

export default handleDrop
