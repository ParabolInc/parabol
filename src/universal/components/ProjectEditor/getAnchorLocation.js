const getAnchorLocation = (editorState) => {
  const selection = editorState.getSelection();
  const currentContent = editorState.getCurrentContent();
  const anchorKey = selection.getAnchorKey();
  return {
    anchorOffset: selection.getAnchorOffset() - 1,
    block: currentContent.getBlockForKey(anchorKey)
  }
};

export default getAnchorLocation;