import {getVisibleSelectionRect} from 'draft-js'

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
