import {Modifier} from 'draft-js';
import {textTags} from 'universal/utils/constants';

const entitizeText = (contentState, selectionState) => {
  const anchorOffset = selectionState.getAnchorOffset();
  const anchorKey = selectionState.getAnchorKey();
  const focusOffset = selectionState.getFocusOffset();
  const focusKey = selectionState.getFocusKey();
  let currentKey = anchorKey;
  let cs = contentState;
  while (currentKey) {
    const currentBlock = contentState.getBlockForKey(currentKey);
    const currentStart = anchorKey === currentKey ? anchorOffset : 0;
    const currentEnd = focusKey === currentKey ? focusOffset : currentBlock.getLength();
    const blockText = currentBlock.getText().slice(currentStart, currentEnd);
    textTags.forEach((tag) => {
      const startIdx = blockText.indexOf(tag);
      if (startIdx !== -1) {
        const contentStateWithEntity = cs.createEntity('TAG', 'IMMUTABLE', {value: tag.slice(1)});
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        cs = Modifier.applyEntity(
          cs,
          selectionState.merge({
            anchorKey: currentKey,
            focusKey: currentKey,
            anchorOffset: startIdx,
            focusOffset: startIdx + tag.length
          }),
          entityKey
        );
      }
    });
    if (focusKey === currentKey) {
      return contentState === cs ? null : cs.merge({
        selectionAfter: contentState.getSelectionAfter()
      })
    }
    currentKey = contentState.getKeyAfter(currentKey);
  }
};

export default entitizeText;