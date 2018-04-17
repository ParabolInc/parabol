/*
 * Make a list of all the entities mentioned across all the reflections
 */
const getEntityNameArrFromResponses = (reflectionEntities = []) => {
  const entitySet = new Set();
  for (let jj = 0; jj < reflectionEntities.length; jj++) {
    const entities = reflectionEntities[jj];
    for (let ii = 0; ii < entities.length; ii++) {
      const entity = entities[ii];
      const {name} = entity;
      entitySet.add(name);
    }
  }
  return Array.from(entitySet);
};

export default getEntityNameArrFromResponses;
