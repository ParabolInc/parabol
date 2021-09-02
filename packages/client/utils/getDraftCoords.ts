import {getVisibleSelectionRect} from 'draft-js'

// typescript composite mode yells that FakeClientRect is external but cannot be named
export interface FakeClientRect {
  left: number
  width: number
  right: number
  top: number
  bottom: number
  height: number
}
const getDraftCoords = () => {
  const selection = window.getSelection()
  if (!selection || !selection.rangeCount) {
    return null
  }
  let target = selection.anchorNode
  while (target && target !== document) {
    // make sure the selection is inside draft, this isn't always guaranteed
    if ((target as any).className === 'notranslate public-DraftEditor-content') {
      return getVisibleSelectionRect(window) as ClientRect
    }
    target = target.parentNode
  }
  return null
}

export default getDraftCoords
