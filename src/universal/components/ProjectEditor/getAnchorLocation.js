const getAnchorLocation = (editorState) => {
  const selection = editorState.getSelection();
  const currentContent = editorState.getCurrentContent();
  const anchorKey = selection.getAnchorKey();
  return {
    anchorOffset: selection.getAnchorOffset(),
    block: currentContent.getBlockForKey(anchorKey)
  };
};

export default getAnchorLocation;
