import {useCallback, useRef} from 'react'
import StartDraggingReflectionMutation from '../mutations/StartDraggingReflectionMutation'
import EndDraggingReflectionMutation from '../mutations/EndDraggingReflectionMutation'
import UpdateDragLocationMutation from '../mutations/UpdateDragLocationMutation'
import clientTempId from '../utils/relay/clientTempId'
import useAtmosphere from './useAtmosphere'
import {Times} from '../types/constEnums'

const useSpotlightSimulatedDrag = (meetingId: string, teamId: string) => {
  const atmosphere = useAtmosphere()

  const dragIdRef = useRef<string>()
  const reflectionIdRef = useRef<string>()
  const updateTimerRef = useRef(0)

  const onCloseSpotlight = useCallback(() => {
    clearTimeout(updateTimerRef.current)
    updateTimerRef.current = 0

    const dropTargetType = null
    const dropTargetId = null
    if (!reflectionIdRef.current) return

    EndDraggingReflectionMutation(atmosphere, {
      reflectionId: reflectionIdRef.current,
      dropTargetType,
      dropTargetId,
      dragId: dragIdRef.current
    })
    dragIdRef.current = undefined
    reflectionIdRef.current = undefined
  }, [])

  const onOpenSpotlight = useCallback((reflectionId: string) => {
    dragIdRef.current = clientTempId()
    reflectionIdRef.current = reflectionId
    StartDraggingReflectionMutation(atmosphere, {
      reflectionId,
      dragId: dragIdRef.current,
      isSpotlight: true
    })

    // send regular updates so the remote end doesn't time out the drag
    updateTimerRef.current = window.setInterval(() => {
      if (!dragIdRef.current || !reflectionIdRef.current) return
      UpdateDragLocationMutation(atmosphere, {
        input: {
          id: dragIdRef.current,
          meetingId,
          sourceId: reflectionIdRef.current,
          teamId,
          isSpotlight: true
        }
      })
    }, Times.REFLECTION_STALE_LIMIT / 2)
  }, [])

  return {onOpenSpotlight, onCloseSpotlight}
}

export default useSpotlightSimulatedDrag
