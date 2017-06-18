import {getVisibleSelectionRect} from 'draft-js';

let savedTargetRect;
const getDraftCoords = () => {
  const targetRect = getVisibleSelectionRect(window);
  if (targetRect) {
    savedTargetRect = targetRect;
  } else if (!savedTargetRect) {
    // must be at the beginning
    const selection = window.getSelection();
    if (selection.rangeCount) {
      let node = selection.getRangeAt(0).startContainer;
      while (node !== null) {
        if (node.getAttribute && node.getAttribute('data-block')) {
          savedTargetRect = node.getBoundingClientRect();
          break;
        }
        node = node.parentNode;
      }
    }
  }
  return savedTargetRect;
};

export default getDraftCoords;
