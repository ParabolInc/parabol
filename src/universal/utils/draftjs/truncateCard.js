import {convertFromRaw, Modifier, SelectionState} from 'draft-js';
const MAX_BLOCKS = 5;
const MAX_CHARS = 52;
const ELLIPSIS = '...';

const truncateByBlock = (contentState) => {
  const blockArray = contentState.getBlocksAsArray();
  const lastBlock = blockArray[MAX_BLOCKS - 1];
  if (lastBlock) {
    const focusBlock = contentState.getLastBlock();
    if (focusBlock === lastBlock) return contentState;
    const selectionState = new SelectionState({
      anchorOffset: lastBlock.getLength() + 1,
      focusOffset: focusBlock.getLength(),
      anchorKey: lastBlock.getKey(),
      focusKey: focusBlock.getKey(),
      isBackward: false,
      hasFocus: false
    });
    return Modifier.removeRange(
      contentState,
      selectionState,
      'forward'
    );
  }
  return contentState;
};

// truncate on MAX_CHARS chars or MAX_BLOCKS line breaks
const truncateCard = (content) => {
  const contentState = truncateByBlock(convertFromRaw(JSON.parse(content)));
  const length = contentState.getPlainText().length;
  if (length <= MAX_CHARS) return contentState;
  let block = contentState.getFirstBlock();
  let curLength = 0;
  for (let i = 0; i < MAX_BLOCKS; i++) {
    const blockLen = block.getLength();
    const key = block.getKey();
    if (curLength + blockLen > MAX_CHARS) {
      const lastBlock = contentState.getLastBlock().getKey();
      const selection = new SelectionState({
        anchorOffset: Math.max(0, MAX_CHARS - curLength - ELLIPSIS.length),
        focusOffset: blockLen,
        anchorKey: key,
        focusKey: lastBlock,
        isBackward: false,
        hasFocus: false
      });
      return Modifier.replaceText(
        contentState,
        selection,
        ELLIPSIS
      );
    }
    curLength += blockLen;
    block = contentState.getBlockAfter(key);
  }
  // should never reach this
  return contentState;
};

export default truncateCard;