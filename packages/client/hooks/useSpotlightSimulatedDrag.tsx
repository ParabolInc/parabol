import {MutableRefObject, useCallback, useEffect, useRef} from 'react'
import EndDraggingReflectionMutation from '../mutations/EndDraggingReflectionMutation'
import useAtmosphere from './useAtmosphere'
import {GroupingKanban_meeting} from '~/__generated__/GroupingKanban_meeting.graphql'
import {commitLocalUpdate} from 'react-relay'
import {Times} from '~/types/constEnums'

const useSpotlightSimulatedDrag = (
  meeting: GroupingKanban_meeting,
  dragIdRef: MutableRefObject<string | undefined>
) => {
  const atmosphere = useAtmosphere()
  const reflectionIdRef = useRef<string>()
  const timeoutRef = useRef(0)
  const {id: meetingId, spotlightGroup} = meeting

  // handle the case when someone steals the reflection
  useEffect(() => {
    if (reflectionIdRef.current && !spotlightGroup) {
      const reflectionId = reflectionIdRef.current
      commitLocalUpdate(atmosphere, (store) => {
        const reflection = store.get(reflectionId)
        const remoteDrag = reflection?.getLinkedRecord('remoteDrag')
        if (remoteDrag) {
          const dragUserName = remoteDrag.getValue('dragUserName')
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: `reflectionInterception:${reflectionId}`,
            autoDismiss: 5,
            message: `Oh no! ${dragUserName} stole your reflection!`
          })
        }
      })
    }
  }, [!spotlightGroup])

  const onCloseSpotlight = useCallback(() => {
    const clone = document.getElementById(`clone-${reflectionIdRef.current}`)
    if (clone && document.body.contains(clone)) {
      document.body.removeChild(clone)
    }
    // Only send the enddragging mutation when we didn't send it before,
    // but always null the spotlight reflection to close the dialog
    const reflectionId = reflectionIdRef.current
    if (!reflectionId) return
    EndDraggingReflectionMutation(atmosphere, {
      reflectionId,
      dropTargetType: null,
      dropTargetId: null,
      dragId: dragIdRef.current
    })

    commitLocalUpdate(atmosphere, (store) => {
      const meetingProxy = store.get(meetingId)
      meetingProxy?.setValue(null, 'spotlightGroup')
      meetingProxy?.setValue(null, 'spotlightReflectionId')
      meetingProxy?.setValue(null, 'spotlightSearchQuery')
    })
    dragIdRef.current = undefined
    reflectionIdRef.current = undefined
    clearTimeout(timeoutRef.current)
  }, [meetingId])

  const onOpenSpotlight = useCallback(
    (reflectionId: string) => {
      reflectionIdRef.current = reflectionId

      commitLocalUpdate(atmosphere, (store) => {
        const reflectionGroupId = store.get(reflectionId)?.getValue('reflectionGroupId') as string
        const reflectionGroup = reflectionGroupId && store.get(reflectionGroupId)
        const meetingProxy = store.get(meetingId)
        reflectionGroup && meetingProxy?.setLinkedRecord(reflectionGroup, 'spotlightGroup')
        meetingProxy?.setValue(reflectionId, 'spotlightReflectionId')
      })
      timeoutRef.current = window.setTimeout(() => {
        onCloseSpotlight()
      }, Times.REFLECTION_SPOTLIGHT_DRAG_STALE_TIMEOUT)
    },
    [meetingId]
  )

  return {onOpenSpotlight, onCloseSpotlight}
}

export default useSpotlightSimulatedDrag
