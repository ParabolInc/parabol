import {RefObject, useCallback, useEffect, useLayoutEffect, useRef} from 'react'
import EndDraggingReflectionMutation from '../mutations/EndDraggingReflectionMutation'
import useAtmosphere from './useAtmosphere'
import {GroupingKanban_meeting} from '~/__generated__/GroupingKanban_meeting.graphql'
import {commitLocalUpdate} from 'react-relay'
import {BezierCurve, Times} from '~/types/constEnums'
import cloneReflection from '~/utils/retroGroup/cloneReflection'
import clientTempId from '~/utils/relay/clientTempId'
import StartDraggingReflectionMutation from '../mutations/StartDraggingReflectionMutation'
import {PortalStatus} from './usePortal'
import {Elevation} from '~/styles/elevation'

const useSpotlightSimulatedDrag = (
  meeting: GroupingKanban_meeting,
  sourceRef: RefObject<HTMLDivElement>,
  portalStatus: number
) => {
  const atmosphere = useAtmosphere()

  const dragIdRef = useRef<string>()
  const reflectionIdRef = useRef<string>()
  const updateTimerRef = useRef(0)
  const srcDestinationRef = useRef<HTMLDivElement | null>(null)
  const {id: meetingId, spotlightReflection} = meeting

  useLayoutEffect(() => {
    const {current: srcDestination} = srcDestinationRef
    const {current: reflectionId} = reflectionIdRef
    const {current: source} = sourceRef
    // wait for the portal to enter to get the source's destination bbox
    if (
      portalStatus !== PortalStatus.Entered ||
      !source ||
      !reflectionId ||
      !srcDestination ||
      dragIdRef.current
    ) {
      return
    }
    const destinationBbox = srcDestination.getBoundingClientRect()
    const sourceBbox = source.getBoundingClientRect()
    const {style: destinationStyle} = srcDestination
    destinationStyle.opacity = '0' // hide destination source while cloning
    const clone = cloneReflection(source, reflectionId)
    const {style: cloneStyle} = clone
    const {left: startLeft, top: startTop} = sourceBbox
    const {left: endLeft, top: endTop} = destinationBbox
    const roundedEndTop = Math.round(endTop) // fractional top pixel throws off calc
    cloneStyle.left = `${startLeft}px`
    cloneStyle.top = `${startTop}px`
    cloneStyle.borderRadius = `4px`
    cloneStyle.boxShadow = `${Elevation.CARD_SHADOW}`
    cloneStyle.overflow = `hidden`
    const transitionTimeout = setTimeout(() => {
      cloneStyle.transform = `translate(${endLeft - startLeft}px,${roundedEndTop - startTop}px)`
      cloneStyle.transition = `transform ${Times.SPOTLIGHT_MODAL_DELAY}ms ${BezierCurve.DECELERATE}`
    }, 0)
    const removeCloneTimeout = setTimeout(() => {
      if (clone && document.body.contains(clone)) {
        document.body.removeChild(clone)
        destinationStyle.opacity = '1' // show destination src once clone is removed
      }
    }, Times.SPOTLIGHT_MODAL_TOTAL_DURATION)
    dragIdRef.current = clientTempId()
    if (!reflectionId) return
    StartDraggingReflectionMutation(atmosphere, {
      reflectionId,
      dragId: dragIdRef.current,
      isSpotlight: true
    })
    return () => {
      clearTimeout(transitionTimeout)
      clearTimeout(removeCloneTimeout)
    }
  }, [portalStatus])

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

  return {onOpenSpotlight, onCloseSpotlight, srcDestinationRef}
}

export default useSpotlightSimulatedDrag
