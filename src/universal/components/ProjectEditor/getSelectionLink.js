const getSelectionLink = (editorState, selection) => {
  const startKey = selection.getStartKey();
  const endKey = selection.getEndKey();
  const currentContent = editorState.getCurrentContent();
  let currentKey = endKey;
  let currentBlock = currentContent.getBlockForKey(endKey);
  let i = 0;
  while (currentBlock) {
    i++;
    const startChar = currentKey === startKey ? selection.getStartOffset() : 0;
    const charList = currentBlock.getCharacterList();
    const endChar = currentKey === endKey ? selection.getEndOffset() : charList.size - 1;
    const subset = charList.slice(startChar, endChar);
    const lastLinkChar = subset.findLast((value) => {
      return value.getEntity() && currentContent.getEntity(value.getEntity()).getType() === 'LINK';
    });
    if (lastLinkChar) {
      return currentContent.getEntity(lastLinkChar.getEntity()).getData().href;
    }
    if (currentKey === startKey) return null;
    currentKey = currentContent.getKeyBefore(currentKey);
    currentBlock = currentContent.getBlockForKey(currentKey);
    if (i >= 1000) {
      break;
    }
  }
  return null;
};

export default getSelectionLink;
