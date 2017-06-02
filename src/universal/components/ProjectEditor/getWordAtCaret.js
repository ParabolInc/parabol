const LAST_NON_WHITESPACE = /\S+$/;
const FIRST_WHITESPACE = /\s/;

const getWordAtCaret = (editorState) => {
  const selection = editorState.getSelection();
  if (!selection.getHasFocus()) return {blur: true};
  const currentContent = editorState.getCurrentContent();
  const currentBlock = currentContent.getBlockForKey(selection.getStartKey());
  const startOffset = selection.getStartOffset();
  const fullBlockText = currentBlock.getText();
  const textToCaretLeft = fullBlockText.slice(0, startOffset);
  const wordStartIdx = textToCaretLeft.search(LAST_NON_WHITESPACE);
  if (wordStartIdx === -1) {
    const lastChunk = textToCaretLeft.slice(0, textToCaretLeft.length - 1);
    const lastStartIdx = lastChunk.search(LAST_NON_WHITESPACE);
    if (lastStartIdx === -1) {
      return {};
    }
    const lastWord = lastChunk.slice(lastStartIdx);
    //if (lastWord === 'www.google.com') debugger
    return {
      start: lastStartIdx,
      end: lastStartIdx + lastWord.length,
      lastWord,
      entity: currentBlock.getEntityAt(startOffset - 1)
    };
  }
  const maybeWordEndOffset = fullBlockText.slice(wordStartIdx + 1).search(FIRST_WHITESPACE);
  const wordEndOffset = maybeWordEndOffset === -1 ? fullBlockText.length : maybeWordEndOffset;
  const wordEndIdx = wordStartIdx + wordEndOffset + 1;
  const word = fullBlockText.slice(wordStartIdx, wordEndIdx);
  return {
    start: wordStartIdx,
    end: wordEndIdx,
    nextChar: fullBlockText[wordEndIdx],
    word,
    // offset by -1 otherwise a menu will pop up at the end of an entity
    entity: currentBlock.getEntityAt(startOffset - 1)
  }
};

export default getWordAtCaret;