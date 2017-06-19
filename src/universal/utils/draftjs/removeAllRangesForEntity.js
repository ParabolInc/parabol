import {Modifier} from 'draft-js';

const removeAllRangesForEntity = (editorState, content, entityType, eqFn) => {
  const rawContent = JSON.parse(content);
  const {blocks, entityMap} = rawContent;
  const entityKeys = Object.keys(entityMap);
  const archivedTags = [];
  for (let i = 0; i < entityKeys.length; i++) {
    const key = entityKeys[i];
    const entity = entityMap[key];
    if (entity.type === entityType && eqFn(entity.data)) {
      archivedTags.push(key);
    }
  }
  let contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();
  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i];
    const {entityRanges, key: blockKey, text} = block;
    const removalRanges = [];
    for (let j = 0; j < entityRanges.length; j++) {
      const range = entityRanges[j];
      const entityKey = String(range.key);
      if (archivedTags.indexOf(entityKey) !== -1) {
        const offset = range.offset;
        const entityEnd = offset + range.length;
        const end = offset === 0 && text[entityEnd] === ' ' ? entityEnd + 1 : entityEnd;
        const start = text[offset - 1] === ' ' ? offset - 1 : offset;
        removalRanges.push({start, end});
      }
    }
    removalRanges.sort((a, b) => a.end < b.end ? 1 : -1);
    for (let j = 0; j < removalRanges.length; j++) {
      const range = removalRanges[j];
      const selectionToRemove = selectionState.merge({
        anchorKey: blockKey,
        focusKey: blockKey,
        anchorOffset: range.start,
        focusOffset: range.end
      });
      contentState = Modifier.removeRange(contentState, selectionToRemove, 'backward');
    }
    if (contentState.getBlockForKey(blockKey).getText() === '') {
      contentState = contentState.merge({
        blockMap: contentState.getBlockMap().delete(blockKey)
      });
    }
  }
  return contentState === editorState.getCurrentContent() ? null : contentState;
};

export default removeAllRangesForEntity;
