// getVisibleSelectionRect is brittle AF so we make our own

let cache;
const getDraftCoords = (editorRef) => {
  const editorEl = editorRef.refs.editor;
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    // if the window selection is within the editor, use it. otherwise, toss it
    if (editorEl.contains(range.startContainer)) {
      cache = range.getClientRects()[0];
    }
  }

  return cache || editorEl.getBoundingClientRect();
};

export default getDraftCoords;
