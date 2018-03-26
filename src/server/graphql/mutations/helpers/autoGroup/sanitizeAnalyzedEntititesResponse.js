const sanitizeAnalyzedEntitiesResponse = (response) => {
  if (!response) return null;
  const [firstResponse] = response;
  if (!firstResponse) return null;
  const {entities} = firstResponse;
  if (!Array.isArray(entities)) return null;
  const validEntities = [];
  for (let ii = 0; ii < entities.length; ii++) {
    const entity = entities[ii];
    const {name, salience} = entity;
    if (!name || !salience) continue;
    validEntities.push(entity);
  }
  return {
    ...firstResponse,
    entities: validEntities
  };
};

export default sanitizeAnalyzedEntitiesResponse;
