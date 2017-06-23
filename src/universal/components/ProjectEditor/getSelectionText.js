const getSelectionText = (editorState, selection) => {
  const anchorKey = selection.getAnchorKey();
  const focusKey = selection.getFocusKey();
  if (anchorKey !== focusKey) {
    return null;
  }
  const content = editorState.getCurrentContent();
  const block = content.getBlockForKey(anchorKey);
  const blockText = block.getText();
  return blockText.substring(selection.getStartOffset(), selection.getEndOffset());
};

export default getSelectionText;
