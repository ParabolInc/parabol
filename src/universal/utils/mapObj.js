// @flow

/**
 * Given an object `obj` and a function `fn`, returns a new object
 * in which all the new key/value pairs are the result of applying `fn`
 * to the current key/value pairs.
 */
export default function mapObj(fn: (k: string, v: any) => [string, any], obj: Object) {
  return Object.keys(obj).reduce(
    (newObj, curKey) => {
      const [newKey, newValue] = fn(curKey, obj[curKey]);
      return {
        ...newObj,
        ...{ [newKey]: newValue }
      };
    },
    {}
  );
}
