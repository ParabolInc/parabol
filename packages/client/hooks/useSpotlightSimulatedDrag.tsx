import {MutableRefObject, useCallback, useEffect, useMemo, useRef} from 'react'
import {commitLocalUpdate} from 'react-relay'
import SendClientSegmentEventMutation from '~/mutations/SendClientSegmentEventMutation'
import {Times} from '~/types/constEnums'
import {GroupingKanban_meeting$data} from '~/__generated__/GroupingKanban_meeting.graphql'
import EndDraggingReflectionMutation from '../mutations/EndDraggingReflectionMutation'
import useAtmosphere from './useAtmosphere'

const useSpotlightSimulatedDrag = (
  meeting: GroupingKanban_meeting$data,
  dragIdRef: MutableRefObject<string | undefined>
) => {
  const atmosphere = useAtmosphere()
  const reflectionIdRef = useRef<string>()
  const timeoutRef = useRef(0)
  const {id: meetingId, spotlightGroup, reflectionGroups, spotlightSearchQuery} = meeting
  const reflectionsCount = useMemo(
    () => reflectionGroups.map(({reflections}) => reflections).length,
    [reflectionGroups]
  )

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
    if (!reflectionId || !dragIdRef.current) return
    EndDraggingReflectionMutation(atmosphere, {
      reflectionId,
      dropTargetType: null,
      dropTargetId: null,
      dragId: dragIdRef.current
    })
    SendClientSegmentEventMutation(atmosphere, 'Closed Spotlight', {
      reflectionsCount,
      meetingId,
      reflectionId,
      spotlightSearchQuery
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
