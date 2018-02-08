// hopefully draft adds this to their API because it's just silly
// keeping this around in case we need to use this instead of the raw object
const getAllEntities = (contentState) => {
  const entityIds = new Set();
  const blockMap = contentState.getBlockMap();
  blockMap.forEach((block) => {
    const charList = block.getCharacterList();
    charList.forEach((charMeta) => {
      const entityId = charMeta.getEntity();
      if (entityId) {
        entityIds.add(entityId);
      }
    });
  });
  const entities = [];
  entityIds.forEach((id) => {
    entities.push(contentState.getEntity(id));
  });
  return entities;
};

export default getAllEntities;
