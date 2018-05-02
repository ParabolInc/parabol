/*
 * Make a list of all the entities mentioned across all the reflections
 */
const getAllLemmasFromReflections = (reflectionEntities = []) => {
  const lemmaSet = new Set();
  for (let jj = 0; jj < reflectionEntities.length; jj++) {
    const entities = reflectionEntities[jj];
    for (let ii = 0; ii < entities.length; ii++) {
      const entity = entities[ii];
      const {lemma} = entity;
      lemmaSet.add(lemma);
    }
  }
  return Array.from(lemmaSet);
};

export default getAllLemmasFromReflections;
