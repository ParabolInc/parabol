
const keyLookup = {
  TAG: 'value',
  MENTION: 'userId'
};

const getTypeFromEntityMap = (type, entityMap) => {
  const entityKeys = Object.keys(entityMap);
  const typeSet = new Set();
  const id = keyLookup[type];
  for (let i = 0; i < entityKeys.length; i++) {
    const key = entityKeys[i];
    const entity = entityMap[key];
    if (entity.type === type) {
      typeSet.add(entity.data[id]);
    }
  }
  return Array.from(typeSet);
};

export default getTypeFromEntityMap;

