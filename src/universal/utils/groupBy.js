/* Given an array of objects and a property on each object,
 * return an object of arrays where the key is the prop and the
 * array is every matching obj
 */

/*

Example:

const arr = [{foo: 1, bar: 2}, {foo: 3, bar: 4}, {foo: 1, bar: 5}];
groupBy(arr, 'foo')
{
  1: [{foo: 1, bar: 2}, {foo: 1, bar: 5}],
  3: [{foo: 3, bar: 4}]
}
*/


const groupBy = (arr, prop) => {
  const res = {};
  for (let ii = 0; ii < arr.length; ii++) {
    const obj = arr[ii];
    const val = typeof prop === 'function' ? prop(obj) : obj[prop];
    res[val] = res[val] || [];
    res[val].push(obj);
  }
  return res;
};

export default groupBy;
