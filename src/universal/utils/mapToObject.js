const mapToObject = (map) => {
  const obj = Object.create(null);
  map.forEach((val, key) => {
    obj[key] = val;
  });
  return obj;
};

export default mapToObject;