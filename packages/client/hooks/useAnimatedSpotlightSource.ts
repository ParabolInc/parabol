import {Times} from 'parabol-client/types/constEnums'
import {MutableRefObject, useLayoutEffect, useRef} from 'react'
import useAtmosphere from '~/hooks/useAtmosphere'
import {PortalStatus} from '~/hooks/usePortal'
import SendClientSegmentEventMutation from '~/mutations/SendClientSegmentEventMutation'
import StartDraggingReflectionMutation from '~/mutations/StartDraggingReflectionMutation'
import {Elevation} from '~/styles/elevation'
import {BezierCurve, ElementWidth} from '~/types/constEnums'
import clientTempId from '~/utils/relay/clientTempId'
import cloneReflection from '~/utils/retroGroup/cloneReflection'

const useAnimatedSpotlightSource = (
  portalStatus: PortalStatus,
  reflectionId: string | null,
  dragIdRef: MutableRefObject<string | undefined>
) => {
  const atmosphere = useAtmosphere()
  const sourceRef = useRef<HTMLDivElement | null>(null)
  const sourceCloneRef = useRef<HTMLDivElement | null>(null)

  const startDrag = (reflectionId: string, dragId: string) => {
    StartDraggingReflectionMutation(atmosphere, {
      reflectionId,
      dragId,
      isSpotlight: true
    })
  }

  useLayoutEffect(() => {
    const {current: source} = sourceRef
    const {current: sourceClone} = sourceCloneRef
    // wait for the modal to enter to get the source's bbox
    if (portalStatus !== PortalStatus.Entered || !sourceClone || !reflectionId || !source) return
    const sourceBbox = source.getBoundingClientRect()
    const sourceCloneBbox = sourceClone.getBoundingClientRect()
    const {style: sourceStyle} = source
    sourceStyle.opacity = '0' // hide source while animating sourceClone into modal
    const clone = cloneReflection(sourceClone, reflectionId)
    const {style: cloneStyle} = clone
    const {left: startLeft, top: startTop} = sourceCloneBbox
    const {left: endLeft, top: endTop} = sourceBbox
    const roundedEndTop = Math.round(endTop) // fractional top pixel throws off transform position
    cloneStyle.left = `${startLeft}px`
    cloneStyle.top = `${startTop}px`
    cloneStyle.borderRadius = `4px`
    cloneStyle.boxShadow = `${Elevation.CARD_SHADOW}`
    cloneStyle.overflow = `hidden`
    cloneStyle.paddingTop = `${ElementWidth.REFLECTION_CARD_PADDING}px`
    const transitionTimeout = setTimeout(() => {
      cloneStyle.transform = `translate(${endLeft - startLeft}px,${roundedEndTop - startTop}px)`
      cloneStyle.transition = `transform ${Times.SPOTLIGHT_SOURCE_DURATION}ms ${BezierCurve.DECELERATE}`
    }, 0)
    dragIdRef.current = clientTempId()
    // execute mutation after cloning as the mutation will cause reflection height to change
    startDrag(reflectionId, dragIdRef.current)
    SendClientSegmentEventMutation(atmosphere, 'Opened Spotlight', {
      reflectionId
    })
    const dragInterval = setInterval(() => {
      // execute every second so that the remote animation continues when subscribers refresh page
      if (!dragIdRef.current) return
      startDrag(reflectionId, dragIdRef.current)
    }, 1000)
    const removeCloneTimeout = setTimeout(() => {
      if (clone && document.body.contains(clone)) {
        document.body.removeChild(clone)
        sourceStyle.opacity = '1' // show source once clone is removed
      }
      // Wait for source & modal to animate. Removing clone before modal animation
      // is complete causes flickering as the source opacity is still transitioning.
    }, Times.SPOTLIGHT_SOURCE_DURATION + Times.SPOTLIGHT_MODAL_DURATION)
    return () => {
      clearTimeout(transitionTimeout)
      clearTimeout(removeCloneTimeout)
      clearTimeout(dragInterval)
    }
  }, [portalStatus])

  return {sourceRef, sourceCloneRef}
}

export default useAnimatedSpotlightSource
