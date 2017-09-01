// const resolvePromiseMap = async (promiseMap) => {
//  const keys = Array.from(promiseMap.keys());
//  const promises = Array.from(promiseMap.values());
//  const values = await Promise.all(promises);
//  return new Map(values.map((value, i) => [keys[i], value]));
// };

const resolvePromiseObj = async (promiseObj) => {
  const keys = Object.keys(promiseObj);
  const promises = Object.values(promiseObj);
  const values = await Promise.all(promises);
  return keys.reduce((obj, key, idx) => {
    obj[key] = values[idx];
    return obj;
  }, {});
};

export default resolvePromiseObj;

