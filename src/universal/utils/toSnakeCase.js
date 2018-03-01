
const toSnakeCase = (str) => str.split(/(?=[A-Z])/).join('_').toLowerCase();

export const toSnakeCaseObject = (obj) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    newObj[toSnakeCase(key)] = obj[key];
  });
  return newObj;
};

export default toSnakeCase;
