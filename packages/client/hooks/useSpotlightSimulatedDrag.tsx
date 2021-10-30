import {MutableRefObject, useCallback, useEffect, useRef} from 'react'
import EndDraggingReflectionMutation from '../mutations/EndDraggingReflectionMutation'
import useAtmosphere from './useAtmosphere'
import {GroupingKanban_meeting} from '~/__generated__/GroupingKanban_meeting.graphql'
import {commitLocalUpdate} from 'react-relay'

const useSpotlightSimulatedDrag = (
  meeting: GroupingKanban_meeting,
  dragIdRef: MutableRefObject<string | undefined>
) => {
  const atmosphere = useAtmosphere()
  const reflectionIdRef = useRef<string>()
  const updateTimerRef = useRef(0)
  const {id: meetingId, spotlightReflection} = meeting

  // handle the case when someone steals the reflection
  useEffect(() => {
    if (reflectionIdRef.current && !spotlightReflection) {
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
  }, [!spotlightReflection])

  const onCloseSpotlight = useCallback(() => {
    clearTimeout(updateTimerRef.current)
    updateTimerRef.current = 0
    const clone = document.getElementById(`clone-${reflectionIdRef.current}`)
    if (clone && document.body.contains(clone)) {
      document.body.removeChild(clone)
    }
    // Only send the enddragging mutation when we didn't send it before,
    // but always null the spotlight reflection to close the dialog
    const reflectionId = reflectionIdRef.current
    reflectionId &&
      EndDraggingReflectionMutation(atmosphere, {
        reflectionId,
        dropTargetType: null,
        dropTargetId: null,
        dragId: dragIdRef.current
      })

    commitLocalUpdate(atmosphere, (store) => {
      const meetingProxy = store.get(meetingId)
      meetingProxy?.setValue(null, 'spotlightReflection')
      const reflection = store.get(reflectionIdRef.current!)
      // set isDropping to true so that the source is added back to its original position in kanban
      reflection?.setValue(true, 'isDropping')
    })
    dragIdRef.current = undefined
    reflectionIdRef.current = undefined
  }, [meetingId])

  const onOpenSpotlight = useCallback(
    (reflectionId: string) => {
      reflectionIdRef.current = reflectionId

      commitLocalUpdate(atmosphere, (store) => {
        const reflection = store.get(reflectionId)
        const meetingProxy = store.get(meetingId)
        reflection && meetingProxy?.setLinkedRecord(reflection, 'spotlightReflection')
      })
    },
    [meetingId]
  )

  return {onOpenSpotlight, onCloseSpotlight, dragIdRef}
}

export default useSpotlightSimulatedDrag
