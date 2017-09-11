const mergeObjectsWithArrValues = (...objects) => {
  const masterObject = {...objects[0]};
  for (let i = 1; i < objects.length; i++) {
    const subset = objects[i];
    Object.keys(subset).forEach((userId) => {
      masterObject[userId] = masterObject[userId] || [];
      masterObject[userId].push(...subset[userId]);
    });
  }
  return masterObject;
};

export default mergeObjectsWithArrValues;
