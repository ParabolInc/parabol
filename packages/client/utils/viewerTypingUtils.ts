import {AriaLabels} from '../types/constEnums'

export const getActiveElement = () => document.activeElement as HTMLElement
export const getAriaLabel = (htmlElement: HTMLElement) => htmlElement.getAttribute('aria-label')

const hasUnsentTaskDraft = () =>
  [...document.querySelectorAll<HTMLElement>('[data-task-draft] [contenteditable="true"]')].some(
    (editor) => editor.innerText.trim().length > 0
  )

export const isViewerTyping = () => {
  if (hasUnsentTaskDraft()) return true
  const activeElement = getActiveElement()
  if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
    return activeElement.value.trim().length > 0
  }

  if (activeElement instanceof HTMLElement && activeElement.isContentEditable) {
    return activeElement.innerText.trim().length > 0
  }

  return false
}

const textInputTypes = new Set(['text', 'search', 'email', 'url', 'tel', 'number'])

// the cursor is in a text box, whether or not anything is typed in it yet
export const isViewerInTextField = () => {
  const activeElement = getActiveElement()
  if (activeElement instanceof HTMLTextAreaElement) return true
  if (activeElement instanceof HTMLInputElement) return textInputTypes.has(activeElement.type)
  return activeElement instanceof HTMLElement && activeElement.isContentEditable
}

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
