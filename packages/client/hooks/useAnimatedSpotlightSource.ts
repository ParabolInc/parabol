import {Times} from 'parabol-client/types/constEnums'
import {type MutableRefObject, useLayoutEffect, useRef} from 'react'
import useAtmosphere from '~/hooks/useAtmosphere'
import StartDraggingReflectionMutation from '~/mutations/StartDraggingReflectionMutation'
import {Elevation} from '~/styles/elevation'
import {BezierCurve, ElementWidth} from '~/types/constEnums'
import clientTempId from '~/utils/relay/clientTempId'
import cloneReflection from '~/utils/retroGroup/cloneReflection'
import SendClientSideEvent from '~/utils/SendClientSideEvent'

const useAnimatedSpotlightSource = (
  isOpen: boolean,
  reflectionId: string | null | undefined,
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
    if (!isOpen || !sourceClone || !reflectionId || !source) return
    const sourceBbox = source.getBoundingClientRect()
    const sourceCloneBbox = sourceClone.getBoundingClientRect()
    const {style: sourceStyle} = source
    sourceStyle.opacity = '0'
    const clone = cloneReflection(sourceClone, reflectionId)
    const {style: cloneStyle} = clone
    const {left: startLeft, top: startTop} = sourceCloneBbox
    const {left: endLeft, top: endTop} = sourceBbox
    const roundedEndTop = Math.round(endTop)
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
    startDrag(reflectionId, dragIdRef.current)
    SendClientSideEvent(atmosphere, 'Opened Spotlight', {reflectionId})
    const dragInterval = setInterval(() => {
      if (!dragIdRef.current) return
      startDrag(reflectionId, dragIdRef.current)
    }, 1000)
    const removeCloneTimeout = setTimeout(() => {
      if (clone && document.body.contains(clone)) {
        document.body.removeChild(clone)
        sourceStyle.opacity = '1'
      }
    }, Times.SPOTLIGHT_SOURCE_DURATION + Times.SPOTLIGHT_MODAL_DURATION)
    return () => {
      clearTimeout(transitionTimeout)
      clearTimeout(removeCloneTimeout)
      clearInterval(dragInterval)
    }
  }, [isOpen])

  return {sourceRef, sourceCloneRef}
}

export default useAnimatedSpotlightSource
