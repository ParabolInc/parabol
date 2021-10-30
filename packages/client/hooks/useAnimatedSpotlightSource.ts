import useAtmosphere from '~/hooks/useAtmosphere'
import clientTempId from '~/utils/relay/clientTempId'
import {BezierCurve} from '~/types/constEnums'
import {Times} from 'parabol-client/types/constEnums'
import {Elevation} from '~/styles/elevation'
import cloneReflection from '~/utils/retroGroup/cloneReflection'
import {PortalStatus} from '~/hooks/usePortal'
import {MutableRefObject, useLayoutEffect, useRef} from 'react'
import StartDraggingReflectionMutation from '~/mutations/StartDraggingReflectionMutation'

const useAnimatedSpotlightSource = (
  portalStatus: PortalStatus,
  reflectionId: string | undefined,
  dragIdRef: MutableRefObject<string | undefined>
) => {
  const atmosphere = useAtmosphere()
  const sourceRef = useRef<HTMLDivElement | null>(null)
  const sourceCloneRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const {current: source} = sourceRef
    const {current: sourceClone} = sourceCloneRef
    // wait for the portal to enter to get the source's bbox
    if (portalStatus !== PortalStatus.Entered || !sourceClone || !reflectionId || !source) return
    const sourceBbox = source.getBoundingClientRect()
    const sourceCloneBbox = sourceClone.getBoundingClientRect()
    const {style: sourceStyle} = source
    sourceStyle.opacity = '0' // hide source while cloning
    const clone = cloneReflection(sourceClone, reflectionId)
    const {style: cloneStyle} = clone
    const {left: startLeft, top: startTop} = sourceCloneBbox
    const {left: endLeft, top: endTop} = sourceBbox
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
        sourceStyle.opacity = '1' // show source once clone is removed
      }
    }, Times.SPOTLIGHT_MODAL_TOTAL_DURATION)
    dragIdRef.current = clientTempId()
    if (!reflectionId) return
    // execute mutation after cloning as the mutation will cause reflection height to change
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

  return {sourceRef, sourceCloneRef}
}

export default useAnimatedSpotlightSource
