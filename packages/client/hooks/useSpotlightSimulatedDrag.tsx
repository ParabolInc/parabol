import {useCallback, useRef} from 'react'
import StartDraggingReflectionMutation from '../mutations/StartDraggingReflectionMutation'
import EndDraggingReflectionMutation from '../mutations/EndDraggingReflectionMutation'
import clientTempId from '../utils/relay/clientTempId'
import useAtmosphere from './useAtmosphere'

const useSpotlightSimulatedDrag = () => {
  const atmosphere = useAtmosphere()

  const dragId = useRef<string>()
  const reflectionId = useRef<string>()

  const onCloseSpotlight = useCallback(() => {
    const dropTargetType = null
    const dropTargetId = null
    if (!reflectionId.current) return

    EndDraggingReflectionMutation(atmosphere, {
      reflectionId: reflectionId.current,
      dropTargetType,
      dropTargetId,
      dragId: dragId.current
    })
    dragId.current = undefined
    reflectionId.current = undefined
  }, [])

  const onOpenSpotlight = useCallback((reflId: string) => {
    dragId.current = clientTempId()
    reflectionId.current = reflId
    StartDraggingReflectionMutation(atmosphere, {reflectionId: reflId, dragId: dragId.current})
  }, [])

  return {onOpenSpotlight, onCloseSpotlight}
}

export default useSpotlightSimulatedDrag
