import {AriaLabels} from '../types/constEnums'

export const getActiveElement = () => document.activeElement as HTMLElement
export const getAriaLabel = (htmlElement: HTMLElement) => htmlElement.getAttribute('aria-label')

export const isViewerTypingInTask = () => {
  const activeElement = getActiveElement()
  const ariaLabel = getAriaLabel(activeElement)
  return (
    ariaLabel === AriaLabels.TASK_EDITOR &&
    (activeElement.contentEditable === 'true' || activeElement.tagName === 'TEXTAREA')
  )
}

export const isViewerTypingInComment = () => {
  const activeElement = getActiveElement()
  const ariaLabel = getAriaLabel(activeElement)
  return (
    ariaLabel === AriaLabels.COMMENT_EDITOR &&
    (activeElement.contentEditable === 'true' || activeElement.tagName === 'TEXTAREA')
  )
}
