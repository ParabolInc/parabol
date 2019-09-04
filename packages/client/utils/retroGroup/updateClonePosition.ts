import {Elevation} from '../../styles/elevation'
import {BezierCurve, Times} from '../../types/constEnums'

export const getMinTop = (top: number, targetEl: HTMLElement | null) => {
  if (top >= 0) return top
  let dropzone = targetEl
  while (dropzone && dropzone.hasAttribute) {
    if (dropzone.hasAttribute('data-dropzone')) return dropzone.getBoundingClientRect().top
    dropzone = dropzone.parentElement
  }
  return top
}

const getTransition = (isClipped: boolean) => {
  const t = `${Times.REFLECTION_DROP_DURATION}ms ${BezierCurve.DECELERATE}`
  const transition = `box-shadow ${t}, transform ${t}`
  return isClipped ? `${transition}, opacity ${Times.REFLECTION_DROP_DURATION / 2}ms ${BezierCurve.DECELERATE} ${Times.REFLECTION_DROP_DURATION / 2}ms` : transition
}

export const getDroppingStyles = (targetEl: HTMLDivElement, bbox: ClientRect, maxTop: number) => {
  const {top, left} = bbox
  const minTop = getMinTop(top, targetEl)
  const clippedTop = Math.min(Math.max(minTop, top), maxTop - bbox.height)
  const isClipped = clippedTop !== top
  return {
    transform: `translate(${left}px,${clippedTop}px)`,
    transition: getTransition(isClipped),
    opacity: isClipped ? 0 : 1
  }
}

const updateClonePosition = (targetEl: HTMLDivElement, reflectionId: string, maxTop: number) => {
  const clone = document.getElementById(`clone-${reflectionId}`)
  if (!clone) return
  const bbox = targetEl.getBoundingClientRect()
  if (!bbox) {
    document.body.removeChild(clone)
    return
  }
  const {transform, transition, opacity} = getDroppingStyles(targetEl, bbox, maxTop)
  const {style} = clone
  style.transform = transform
  style.boxShadow = Elevation.CARD_SHADOW
  style.opacity = String(opacity)
  style.transition = transition
}

export default updateClonePosition
