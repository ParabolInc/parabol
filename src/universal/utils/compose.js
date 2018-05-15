/**
 * Composes a sequence of functions.
 *
 * e.g.
 *  const timesTwoPlusThree = compose((n) => n * 2, (n) => n + 3);
 *  timesTwoPlusThree(2); // => 7
 *
 * @flow
 */

type MultiArityFn = (...args: Array<any>) => any

type SingleArityFn = (any) => any

const compose = (...fns: Array<SingleArityFn>): MultiArityFn => (...args: Array<any>) => {
  if (!fns.length) {
    return args
  }
  return fns
    .slice(1)
    .filter((item) => typeof item === 'function')
    .reduce((acc, fn) => fn(acc), fns[0](...args))
}

export default compose
