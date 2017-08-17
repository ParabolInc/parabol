// getVisibleSelectionRect is brittle AF so we make our own

const getDraftCoords = (editorRef) => {
  const editorEl = editorRef.refs.editor;
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    // if the window selection is within the editor, use it
    if (editorEl.contains(range.startContainer)) {
      return range.getClientRects()[0];
    }
  }
  return null;
};

export default getDraftCoords;
