/**
 * Returns a new copy of object `obj`, without any of the keys contained in `keys`.
 *
 * @flow
 */

const without = (obj: Object, ...keys: Array<string>): Object =>
  Object.entries(obj)
    .filter(([k]) => !keys.includes(k))
    .reduce((acc, [k, v]) => ({...acc, [k]: v}), {});

export default without;
