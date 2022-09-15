import {MutableRefObject, useRef} from 'react'
import requestDoubleAnimationFrame from '../components/RetroReflectPhase/requestDoubleAnimationFrame'
import {Dims, Point} from '../types/animations'
import {BezierCurve, ElementWidth, Times} from '../types/constEnums'

interface Options<T> {
  isBackground?: boolean
  isGroup?: boolean
  firstRef?: MutableRefObject<T | null>
  offsetLeft?: number
  offsetTop?: number
}

const getScale = (first: Dims, last: Dims) => {
  const scaleY = first.height / last.height
  const scaleX = first.width / last.width
  return {scaleX, scaleY}
}

const getTranslate = <T extends HTMLElement = HTMLDivElement>(
  first: Point,
  parent: Point,
  lastEl: T,
  offsetLeft = 0,
  offsetTop = 0
) => {
  const translateX = first.left - parent.left - lastEl.offsetLeft - offsetLeft
  const translateY = first.top - parent.top - lastEl.offsetTop - offsetTop
  return {translateX, translateY}
}

const useFlip = <T extends HTMLElement = HTMLDivElement>(options: Options<T>) => {
  const {isBackground, firstRef, offsetLeft = 0, offsetTop = 0, isGroup} = options
  const isAnimatedRef = useRef(false)
  const instanceRef = useRef<T>()
  const lastRefCb = (instance: T) => {
    instanceRef.current = instance
    if (!instance || isAnimatedRef.current || !firstRef || !firstRef.current) {
      return
    }
    const firstBBox = firstRef.current.getBoundingClientRect()
    const lastBBox = instance.getBoundingClientRect()
    const {style, offsetParent} = instance
    const parentBBox = offsetParent!.getBoundingClientRect()
    if (!firstBBox || !lastBBox || !parentBBox) return
    const {translateX, translateY} = getTranslate(
      firstBBox,
      parentBBox,
      instance,
      offsetLeft,
      offsetTop
    )
    isAnimatedRef.current = true
    if (isBackground) {
      const {scaleX, scaleY} = getScale(firstBBox, lastBBox)
      firstRef.current.style.opacity = '0'
      style.opacity = '0'
      style.transform = `translate(${translateX}px,${translateY}px)scale(${scaleX},${scaleY})`
      style.transformOrigin = '0 0'
    } else {
      style.overflow = 'hidden'
      style.transform = `translate(${translateX}px,${translateY}px)`
    }
    requestDoubleAnimationFrame(() => {
      style.opacity = ''
      style.transform = ''
      style.transition = `all ${Times.REFLECTION_DEAL_TOTAL_DURATION}ms ${BezierCurve.DECELERATE}`
      style.overflow = ''
    })
  }

  const reverse = () => {
    if (!firstRef) return
    const {current: instance} = instanceRef
    if (!instance) return
    const {style, offsetParent} = instance
    const reset = () => {
      isAnimatedRef.current = false
      style.overflow = ''
      if (firstRef.current) {
        firstRef.current.style.opacity = ''
      }
    }
    style.transition = `all ${Times.REFLECTION_COLLAPSE_DURATION}ms ${BezierCurve.DECELERATE}`
    if (!firstRef.current || !offsetParent) {
      // when only 1 card remainsin the expanded stack, the header may be null
      instance.style.transition = ''
      requestAnimationFrame(() => {
        instance.style.opacity = '0'
      })
    } else {
      const firstBBox = firstRef.current.getBoundingClientRect()
      const parentBBox = offsetParent.getBoundingClientRect()
      const lastBBox = instance.getBoundingClientRect()
      const groupOffset = isGroup ? ElementWidth.REFLECTION_CARD_PADDING : 0
      const {translateX, translateY} = getTranslate(
        firstBBox,
        parentBBox,
        instance,
        offsetLeft,
        offsetTop - groupOffset
      )
      if (isBackground) {
        const {scaleX, scaleY} = getScale(
          {height: firstRef.current.scrollHeight, width: firstBBox.width},
          lastBBox
        )
        style.transform = `translate(${translateX}px,${translateY}px)scale(${scaleX},${scaleY})`
      } else {
        style.transform = `translate(${translateX}px,${translateY}px)`
      }
      style.transformOrigin = '0 0'
      style.overflow = 'hidden'
      if (isBackground) {
        style.opacity = '0'
      }
    }
    setTimeout(reset, Times.REFLECTION_COLLAPSE_DURATION)
  }
  return [lastRefCb, reverse] as [(c: T) => void, () => void]
}

export default useFlip
