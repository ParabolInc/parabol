import {getVisibleSelectionRect} from 'draft-js';

const getBlockTargetRect = () => {
  const selection = window.getSelection();
  if (selection.rangeCount) {
    let node = selection.getRangeAt(0).startContainer;
    while (node !== null) {
      if (node.getAttribute && node.getAttribute('data-block')) {
        return node.getBoundingClientRect();
      }
      node = node.parentNode;
    }
  }
  return undefined;
}

const getDraftCoords = (editorRef) => {
  if (getBlockTargetRect()) {
    return getVisibleSelectionRect(window);
  }
  const range = document.createRange();
  range.setStart(editorRef.refs.editor, 0);
  const selection = window.getSelection();
  selection.addRange(range);
  return getBlockTargetRect();
};

export default getDraftCoords;
