import {RefObject, useCallback, useEffect, useRef} from 'react'
import graphql from 'babel-plugin-relay/macro'
import EndDraggingReflectionMutation from '../mutations/EndDraggingReflectionMutation'
import useAtmosphere from './useAtmosphere'
import {GroupingKanban_meeting} from '~/__generated__/GroupingKanban_meeting.graphql'
import {commitLocalUpdate, useLazyLoadQuery} from 'react-relay'
import {DraggableReflectionCardLocalQuery} from '~/__generated__/DraggableReflectionCardLocalQuery.graphql'
import {BezierCurve, Times} from '~/types/constEnums'
import cloneReflection from '~/utils/retroGroup/cloneReflection'
import clientTempId from '~/utils/relay/clientTempId'
import StartDraggingReflectionMutation from '../mutations/StartDraggingReflectionMutation'

const useSpotlightSimulatedDrag = (
  meeting: GroupingKanban_meeting,
  sourceRef: RefObject<HTMLDivElement>
) => {
  const atmosphere = useAtmosphere()

  const dragIdRef = useRef<string>()
  const reflectionIdRef = useRef<string>()
  const updateTimerRef = useRef(0)
  const srcDestinationRef = useRef<HTMLDivElement | null>(null)
  const isAnimated = useRef(false)
  const {id: meetingId, spotlightReflection} = meeting
  const spotlightReflectionId = spotlightReflection?.id

  const spotlightSearchResults = useLazyLoadQuery<DraggableReflectionCardLocalQuery>(
    graphql`
      query DraggableReflectionCardLocalQuery($reflectionId: ID!, $searchQuery: String!) {
        viewer {
          similarReflectionGroups(reflectionId: $reflectionId, searchQuery: $searchQuery) {
            id
          }
        }
      }
    `,
    // TODO: add search query
    {reflectionId: spotlightReflectionId || '', searchQuery: ''},
    {fetchPolicy: 'store-only'}
  )
  const {viewer} = spotlightSearchResults
  const {similarReflectionGroups} = viewer
  const hasResults = !!similarReflectionGroups

  useEffect(() => {
    const destinationBbox = srcDestinationRef?.current?.getBoundingClientRect()
    const {current: reflectionId} = reflectionIdRef
    if (!destinationBbox || !reflectionId) return
    const sourceBbox = sourceRef?.current?.getBoundingClientRect()
    if (!sourceBbox || !spotlightReflectionId || isAnimated.current) return
    requestAnimationFrame(() => {
      const clone = cloneReflection(sourceRef.current!, spotlightReflectionId)
      const {style} = clone
      const {left: startLeft, top: startTop, height} = sourceBbox
      const {left: endLeft, top: endTop} = destinationBbox
      const roundedEndTop = Math.round(endTop) // fractional top pixel throws off calc
      style.left = `${startLeft}px`
      style.top = `${startTop}px`
      style.borderRadius = `4px`
      style.boxShadow = 'none'
      style.minHeight = `${height}px`
      style.height = `${height}px`
      style.opacity = '1'
      style.overflow = `hidden`
      setTimeout(() => {
        style.transform = `translate(${endLeft - startLeft}px,${roundedEndTop - startTop}px)`
        style.transition = `transform ${Times.SPOTLIGHT_MODAL_DELAY}ms ${BezierCurve.DECELERATE}`
      }, 0)
      isAnimated.current = true
    })
    setTimeout(() => {
      dragIdRef.current = clientTempId()
      StartDraggingReflectionMutation(atmosphere, {
        reflectionId,
        dragId: dragIdRef.current,
        isSpotlight: true
      })
    }, Times.SPOTLIGHT_MODAL_DURATION)
  })

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
    isAnimated.current = false
  }, [meetingId])

  const onOpenSpotlight = useCallback(
    (reflectionId: string) => {
      // dragIdRef.current = clientTempId()
      reflectionIdRef.current = reflectionId
      // StartDraggingReflectionMutation(atmosphere, {
      //   reflectionId,
      //   dragId: dragIdRef.current,
      //   isSpotlight: true
      // })
      // const bbox = reflectionRef?.current?.getBoundingClientRect()
      // console.log('🚀  ~ sourceBbox', {sourceBbox, curr: reflectionRef.current})
      // if (!sourceBbox && bbox) {
      //   setSourceBbox(bbox)
      // }
      // cloneReflection(reflectionRef.current, reflectionId)
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
