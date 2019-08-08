import {MutableRefObject, useRef} from 'react'
import {Dims, Point} from '../types/animations'
import getBBox from '../components/RetroReflectPhase/getBBox'
import {BezierCurve, Times} from '../types/constEnums'
import requestDoubleAnimationFrame from '../components/RetroReflectPhase/requestDoubleAnimationFrame'

interface Options <T>{
  isBackground?: boolean
  firstRef: MutableRefObject<T | null>,
  padding: number
}

const getScale = (first: Dims, last: Dims) => {
  const scaleY =  first.height / last.height
  const scaleX = first.width / last.width
  return {scaleX, scaleY}
}

const getTranslate = <T extends HTMLElement = HTMLDivElement>(first: Point, parent: Point, lastEl: T, padding: number) => {
  const translateX = first.left - parent.left - lastEl.offsetLeft - padding
  const translateY = first.top - parent.top - lastEl.offsetTop - padding
  return {translateX, translateY}
}

const useFlip = <T extends HTMLElement = HTMLDivElement>(options: Options<T>) => {
  const {isBackground, firstRef, padding = 0} = options
  const isAnimatedRef = useRef(false)
  const reverseRef = useRef(() => {})
  const lastRefCb = (instance: T) => {
    if (!instance || isAnimatedRef.current || !firstRef.current) {
      return
    }
    const firstBBox = getBBox(firstRef.current!)
    const lastBBox = getBBox(instance)
    const {style, offsetParent} = instance
    const parentBBox = getBBox(offsetParent)
    if (!firstBBox || !lastBBox || !parentBBox) return
    const {translateX, translateY} = getTranslate(firstBBox, parentBBox, instance, padding)
    isAnimatedRef.current = true
    if (isBackground) {
      const {scaleX, scaleY} = getScale(firstBBox, lastBBox)
      firstRef.current.style.visibility = 'hidden'
      const transformToStart = `translate(${translateX}px,${translateY}px)scale(${scaleX},${scaleY})`
      style.opacity = '0'
      style.transform = transformToStart
      style.transformOrigin = '0 0'
    } else {
      style.transform = `translate(${translateX}px,${translateY}px)`
    }
    requestDoubleAnimationFrame(() => {
      style.opacity = ''
      style.transform = ''
      style.transition = `all ${Times.REFLECTION_DEAL_TOTAL_DURATION}ms ${BezierCurve.DECELERATE}`
    })
    const cachedTransform = style.transform
    reverseRef.current = () => {
      const reset = () => {
        isAnimatedRef.current = false
        if (firstRef.current) {
          firstRef.current.style.visibility = ''
        }
      }
      style.transition = `all ${Times.REFLECTION_DEAL_CARD_DURATION}ms ${BezierCurve.DECELERATE}`
      style.transform = cachedTransform
      style.transformOrigin = '0 0'
      if (isBackground) {
        style.opacity = '0'
      }
      instance.addEventListener('transitionend', reset)
      instance.addEventListener('transitioncancel', reset)
    }
  }
  return [lastRefCb, reverseRef.current] as [(c: T) => void, () => void]
}

export default useFlip
