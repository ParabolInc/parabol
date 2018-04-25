import {getVisibleSelectionRect} from 'draft-js';

const getDraftCoords = () => {
  const selection = window.getSelection();
  if (!selection.rangeCount) {
    return null;
  }
  let target = selection.anchorNode;
  while (target !== document) {
    // make sure the selection is inside draft, this isn't always guaranteed
    if (target.className === 'notranslate public-DraftEditor-content') {
      return getVisibleSelectionRect(window);
    }
    target = target.parentNode;
  }
  return null;
};

export default getDraftCoords;
