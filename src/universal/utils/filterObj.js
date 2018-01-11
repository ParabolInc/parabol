// @flow

/**
 * Given an object `obj` and a function `fn`, returns a new object
 * of key/value pairs which pass the predicate function `fn`.
 */
export default function filterObj(fn: (k: string, v: any) => boolean, obj: Object) {
  return Object.keys(obj).reduce(
    (newObj, curKey) => ({
      ...newObj,
      ...(fn(curKey, obj[curKey]) ? { [curKey]: obj[curKey] } : {})
    }),
    {}
  );
}
