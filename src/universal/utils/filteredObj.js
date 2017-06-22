const filteredObj = (obj) => {
  const keys = Object.keys(obj);
  const newObj = {};
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const val = obj[key];
    if (val !== undefined) {
      newObj[key] = val;
    }
  }
  return newObj;
};

export default filteredObj;