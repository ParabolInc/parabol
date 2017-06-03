import getWordAt from './getWordAt';

const getSearchText = (editorState) => {
  const selection = editorState.getSelection();
  const anchorKey = selection.getAnchorKey();
  const anchorOffset = selection.getAnchorOffset() - 1;
  const currentContent = editorState.getCurrentContent();
  const currentBlock = currentContent.getBlockForKey(anchorKey);
  const blockText = currentBlock.getText();
  return {
    ...getWordAt(blockText, anchorOffset),
    entityKey: currentBlock.getEntityAt(anchorOffset),
    block: currentBlock
  };
};

export default getSearchText;
