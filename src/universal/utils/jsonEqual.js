import isObject from './isObject';

export default function jsonEqual(newObj, oldObj) {
  if (isObject(newObj) && isObject(oldObj)) {
    if (JSON.stringify(newObj) === JSON.stringify(oldObj)) {
      return true;
    }
  }
  return false;
}
