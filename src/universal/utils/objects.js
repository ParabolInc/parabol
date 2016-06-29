
/*
 * A la:
 * const stuff = { name: 'Thing', color: 'blue', age: 17 };
 * const picked = pick(stuff, 'name', 'age');
 */
export function pick(o, ...fields) {
  return fields.reduce((a, x) => {
    if (o.hasOwnProperty(x)) a[x] = o[x];
    return a;
  }, {});
}
