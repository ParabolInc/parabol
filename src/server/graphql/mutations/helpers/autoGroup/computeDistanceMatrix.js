
/*
 * for each entity mentioned in all the reflections,
 * see if it exists for this reflection in particular.
 * if it does, grab the salience, else, set it to 0
 */
const computeDistanceMatrix = (reflectionEntities, entityNameArr) => {
  reflectionEntities.map((entities) => {
    if (!entities) return new Array(entityNameArr.length).fill(0);
    return entityNameArr.map((name) => {
      const entity = entities.find((ent) => ent.name === name);
      return entity ? entity.salience : 0;
    });
  });
};

export default computeDistanceMatrix;
