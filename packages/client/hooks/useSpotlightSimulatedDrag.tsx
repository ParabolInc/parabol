import {useCallback, useEffect, useRef} from 'react'
import StartDraggingReflectionMutation from '../mutations/StartDraggingReflectionMutation'
import EndDraggingReflectionMutation from '../mutations/EndDraggingReflectionMutation'
import UpdateDragLocationMutation from '../mutations/UpdateDragLocationMutation'
import clientTempId from '../utils/relay/clientTempId'
import useAtmosphere from './useAtmosphere'
import {Times} from '../types/constEnums'
import {GroupingKanban_meeting} from '~/__generated__/GroupingKanban_meeting.graphql'
import {commitLocalUpdate} from 'react-relay'

const useSpotlightSimulatedDrag = (meeting: GroupingKanban_meeting) => {
  const atmosphere = useAtmosphere()

  const dragIdRef = useRef<string>()
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
    })
    dragIdRef.current = undefined
    reflectionIdRef.current = undefined
  }, [meetingId])

  const onOpenSpotlight = useCallback(
    (reflectionId: string) => {
      dragIdRef.current = clientTempId()
      reflectionIdRef.current = reflectionId
      StartDraggingReflectionMutation(atmosphere, {
        reflectionId,
        dragId: dragIdRef.current,
        isSpotlight: true
      })

      commitLocalUpdate(atmosphere, (store) => {
        const reflection = store.get(reflectionId)
        const meetingProxy = store.get(meetingId)
        reflection && meetingProxy?.setLinkedRecord(reflection, 'spotlightReflection')
      })

      // send regular updates so the remote end doesn't time out the drag
      updateTimerRef.current = window.setInterval(() => {
        if (!dragIdRef.current || !reflectionIdRef.current) return
        UpdateDragLocationMutation(atmosphere, {
          input: {
            id: dragIdRef.current,
            meetingId,
            sourceId: reflectionIdRef.current,
            teamId: meeting.teamId,
            isSpotlight: true
          }
        })
      }, Times.REFLECTION_STALE_LIMIT / 2)
    },
    [meetingId]
  )

  return {onOpenSpotlight, onCloseSpotlight}
}

export default useSpotlightSimulatedDrag
