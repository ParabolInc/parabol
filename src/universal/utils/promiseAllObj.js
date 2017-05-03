export default async (promiseObj) => {
  const keys = Object.keys(promiseObj);
  const promises = Object.values(promiseObj);
  const values = await Promise.all(promises);
  return values.reduce((newObj, value, idx) => {
    newObj[keys[idx]] = value;
    return newObj;
  }, {});
};
