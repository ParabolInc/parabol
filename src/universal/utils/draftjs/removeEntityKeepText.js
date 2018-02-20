const updateBlockEntityRanges = (blocks, updatedKeyMap) => {
  const nextBlocks = [];
  for (let ii = 0; ii < blocks.length; ii++) {
    const block = blocks[ii];
    const {entityRanges} = block;
    const nextEntityRanges = [];
    for (let jj = 0; jj < entityRanges.length; jj++) {
      const entityRange = entityRanges[jj];
      const nextKey = updatedKeyMap[entityRange.key];
      if (nextKey !== null) {
        nextEntityRanges.push({...entityRange, key: nextKey});
      }
    }
    nextBlocks.push({...block, entityRanges: nextEntityRanges});
  }
  return nextBlocks;
};

/*
 * Removes the underlying entity but keeps the text in place
 * Useful for e.g. removing a mention but keeping the name
 */
const removeEntityKeepText = (rawContent, eqFn) => {
  const {blocks, entityMap} = rawContent;
  const nextEntityMap = [];
  // oldKey: newKey. null is a remove sentinel
  const updatedKeyMap = {};
  const removedEntities = [];
  for (let ii = 0; ii < entityMap.length; ii++) {
    const entity = entityMap[ii];
    if (eqFn(entity)) {
      removedEntities.push(entity);
      updatedKeyMap[ii] = null;
    } else {
      nextEntityMap.push(entity);
      updatedKeyMap[ii] = nextEntityMap.length;
    }
  }

  return {
    rawContent: removedEntities.length === 0 ? rawContent :
      {
        blocks: updateBlockEntityRanges(blocks, updatedKeyMap),
        entityMap: nextEntityMap
      },
    removedEntities
  };
};

export default removeEntityKeepText;
