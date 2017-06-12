const getTagsFromEntityMap = (entityMap) => {
  //const {entityMap} = rawContent;
  const entityKeys = Object.keys(entityMap);
  const tags = [];
  for (let i = 0; i < entityKeys.length; i++) {
    const key = entityKeys[i];
    const entity = entityMap[key];
    if (entity.type === 'TAG') {
      tags.push(entity.data.value);
    }
  }
  return tags;
};

export default getTagsFromEntityMap;