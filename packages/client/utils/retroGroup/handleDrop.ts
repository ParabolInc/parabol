import Atmosphere from '../../Atmosphere'
import {commitLocalUpdate} from 'relay-runtime'
import EndDraggingReflectionMutation from '../../mutations/EndDraggingReflectionMutation'
import {DragReflectionDropTargetTypeEnum} from '~/__generated__/EndDraggingReflectionMutation_meeting.graphql'
import {ReflectionDragState} from '../../components/ReflectionGroup/DraggableReflectionCard'
import useMutationProps from '../../hooks/useMutationProps'

const handleDrop = (
  atmosphere: Atmosphere,
  reflectionId: string,
  drag: ReflectionDragState,
  dropTargetType: DragReflectionDropTargetTypeEnum | null,
  dropTargetId: string | null
) => {
  const {onCompleted, onError} = useMutationProps()
  commitLocalUpdate(atmosphere, (store) => {
    store.get(reflectionId)!.setValue(true, 'isDropping')
  })

  EndDraggingReflectionMutation(
    atmosphere,
    {
      reflectionId,
      dropTargetType,
      dropTargetId,
      dragId: drag.id
    },
    {onCompleted, onError}
  )
}

export default handleDrop
