import {useRef} from 'react'
import requestDoubleAnimationFrame from '../components/RetroReflectPhase/requestDoubleAnimationFrame'
import {BezierCurve, ElementWidth, ReflectionStackPerspective, Times} from '../types/constEnums'
import {RefCallbackInstance} from '../types/generics'

const getScaleX = (i: number) => {
  if (i === 0) return 1
  const multiple = i === 1 ? 2 : 4
  return (
    (ElementWidth.REFLECTION_CARD - ReflectionStackPerspective.X * multiple) /
    ElementWidth.REFLECTION_CARD
  )
}

const useFlipDeal = (count: number) => {
  const isAnimatingRef = useRef(false)
  const lastListItemsRef = useRef([] as RefCallbackInstance[])
  const ref = (idx: number) => (c: RefCallbackInstance) => {
    lastListItemsRef.current[idx] = c
    if (isAnimatingRef.current || !c) return
    if (idx === count - 1) {
      isAnimatingRef.current = true
      const variableDelay = Math.max(
        Times.REFLECTION_DEAL_CARD_MIN_DELAY,
        (Times.REFLECTION_DEAL_TOTAL_DURATION -
          Times.REFLECTION_DEAL_CARD_DURATION -
          Times.REFLECTION_DEAL_CARD_INIT_DELAY) /
          (count - 1)
      )
      let cardSpacing = 0
      for (let i = 0; i < count; i++) {
        const delay = Times.REFLECTION_DEAL_CARD_INIT_DELAY + variableDelay * (count - i - 1)
        const lastReflection = lastListItemsRef.current[i]
        if (!lastReflection) return
        if (i > 0) {
          const bbox = lastReflection.getBoundingClientRect()
          const peek = i < 3 ? ReflectionStackPerspective.Y : 0
          cardSpacing += bbox.height - peek
        }
        const scaleX = getScaleX(i)
        const cachedTransform = `translateY(${-cardSpacing}px)scaleX(${scaleX})`
        const cachedTransition = `transform ${Times.REFLECTION_DEAL_CARD_DURATION}ms ${delay}ms ${BezierCurve.STANDARD_CURVE}`
        lastReflection.style.transform = cachedTransform
        requestDoubleAnimationFrame(() => {
          lastReflection.style.transition = cachedTransition
          lastReflection.style.transform = ''
        })
      }
    }
  }
  const reverse = (count: number) => {
    let cardSpacing = 0
    for (let i = 0; i < count; i++) {
      const lastReflection = lastListItemsRef.current[i]
      if (!lastReflection) return
      if (i > 0) {
        const bbox = lastReflection.getBoundingClientRect()
        const peek = i < 3 ? ReflectionStackPerspective.Y : 0
        cardSpacing += bbox.height - peek
      }
      const thisCardSpace = cardSpacing // scoped inside for-loop
      const scaleX = getScaleX(i)
      lastReflection.style.transition = `transform ${Times.REFLECTION_DEAL_CARD_DURATION}ms ${BezierCurve.STANDARD_CURVE}`
      requestAnimationFrame(() => {
        lastReflection.style.transform = `translateY(${-thisCardSpace}px)scaleX(${scaleX})`
      })
    }
    isAnimatingRef.current = false
  }
  return [ref, reverse] as [typeof ref, typeof reverse]
}

export default useFlipDeal
