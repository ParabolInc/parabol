/*
 * Promise.all fails fast, which means if promsie 2 of 100 fails, it aborts on 2
 * Sometimes, we want all the results & replace the errors with some generic value like null
 * This does that, and does it quickly, assuming that the first promise in the array will resolve first
 */

const promiseAllPartial = async (promiseArr, catchValue = null) => {
  const arr = [];
  for (let ii = 0; ii < promiseArr.length; ii++) {
    const promise = promiseArr[ii];
    try {
      // eslint-disable-next-line no-await-in-loop
      const res = await promise;
      arr.push(res);
    } catch (e) {
      arr.push(catchValue);
    }
  }
  return arr;
};

export default promiseAllPartial;
