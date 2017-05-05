import isObject from './isObject';

export default function jsonEqual(newObj, oldObj) {
  return isObject(newObj) && isObject(oldObj) && JSON.stringify(newObj) === JSON.stringify(oldObj);
}
