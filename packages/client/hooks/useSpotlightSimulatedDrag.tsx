import {useCallback, useRef} from 'react'
import StartDraggingReflectionMutation from '../mutations/StartDraggingReflectionMutation'
import EndDraggingReflectionMutation from '../mutations/EndDraggingReflectionMutation'
import UpdateDragLocationMutation from '../mutations/UpdateDragLocationMutation'
import clientTempId from '../utils/relay/clientTempId'
import useAtmosphere from './useAtmosphere'
import {Times} from '../types/constEnums'

const useSpotlightSimulatedDrag = (meetingId: string, teamId: string) => {
  const atmosphere = useAtmosphere()

  const dragId = useRef<string>()
  const reflectionId = useRef<string>()
  const updateTimer = useRef(0)

  const onCloseSpotlight = useCallback(() => {
    clearTimeout(updateTimer.current)
    updateTimer.current = 0

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
    StartDraggingReflectionMutation(atmosphere, {
      reflectionId: reflId,
      dragId: dragId.current,
      isSpotlight: true
    })

    // send regular updates so the remote end doesn't time out the drag
    updateTimer.current = window.setInterval(() => {
      UpdateDragLocationMutation(atmosphere, {
        input: {
          id: dragId.current,
          meetingId,
          sourceId: reflectionId.current,
          teamId,
          isSpotlight: true
        }
      })
    }, Times.REFLECTION_STALE_LIMIT / 2)
  }, [])

  return {onOpenSpotlight, onCloseSpotlight}
}

export default useSpotlightSimulatedDrag
